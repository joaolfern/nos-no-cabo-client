import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { render } from '@/__tests__/utils.test'
import { mockStats, resetMockMetrics } from '@/__mocks__/data/metrics'
import { server } from '@/__mocks__/node'
import { V1_API_URL } from '@/config/env'
import type { IWebsite } from '@/interfaces/IWebsite'
import { queryClient } from '@/providers/QueryProvider/queryClient'
import { WebsiteVotes } from '@/pages/Website/components/WebsiteVotes/WebsiteVotes'
import { formatCompactNumber } from '@/utils/formatCompactNumber/formatCompactNumber'

const likeButton = () => screen.getByTitle('Gostei')
const dislikeButton = () => screen.getByTitle('Não gostei')

async function renderVotes() {
  const seeded = mockStats('1')
  await render(<WebsiteVotes websiteId='1' />)
  await waitFor(() =>
    expect(likeButton()).toHaveTextContent(formatCompactNumber(seeded.likes))
  )
  return seeded
}

beforeEach(() => {
  resetMockMetrics()
  localStorage.clear()
})

describe('WebsiteVotes', () => {
  it('never shows a 0 next to a remembered vote while the counts load', async () => {
    localStorage.setItem('nnc-votes', JSON.stringify({ '1': 1 }))
    const seeded = mockStats('1')

    await render(<WebsiteVotes websiteId='1' />)

    expect(likeButton()).toHaveAttribute('aria-pressed', 'true')
    expect(likeButton()).not.toHaveTextContent(/\d/)
    expect(likeButton()).toBeDisabled()

    await waitFor(() =>
      expect(likeButton()).toHaveTextContent(formatCompactNumber(seeded.likes))
    )
    expect(likeButton()).not.toBeDisabled()
  })

  it('shows a dash when the counts are unavailable', async () => {
    server.use(
      http.get(`${V1_API_URL}/websites/:id/page`, ({ params }) =>
        HttpResponse.json({
          website: { id: params.id },
          neighbours: { previous: null, next: null, random: null },
          stats: null,
        })
      )
    )
    await render(<WebsiteVotes websiteId='1' />)

    await waitFor(() => expect(likeButton()).toHaveTextContent('–'))
    expect(dislikeButton()).toHaveTextContent('–')
  })

  it('likes, switches to a dislike and removes the vote', async () => {
    const seeded = await renderVotes()

    await userEvent.click(likeButton())
    await waitFor(() => expect(likeButton()).not.toBeDisabled())
    expect(likeButton()).toHaveAttribute('aria-pressed', 'true')
    expect(likeButton()).toHaveTextContent(
      formatCompactNumber(seeded.likes + 1)
    )

    await userEvent.click(dislikeButton())
    await waitFor(() => expect(dislikeButton()).not.toBeDisabled())
    expect(dislikeButton()).toHaveAttribute('aria-pressed', 'true')
    expect(likeButton()).toHaveTextContent(formatCompactNumber(seeded.likes))
    expect(dislikeButton()).toHaveTextContent(
      formatCompactNumber(seeded.dislikes + 1)
    )

    await userEvent.click(dislikeButton())
    await waitFor(() => expect(dislikeButton()).not.toBeDisabled())
    expect(dislikeButton()).toHaveAttribute('aria-pressed', 'false')
    expect(dislikeButton()).toHaveTextContent(
      formatCompactNumber(seeded.dislikes)
    )
  })

  it('updates the like count in the cached feed and top list', async () => {
    const feedKey = ['websites', 'list', { sort: 'novos' }]
    const topKey = ['websites', 'top', 5]
    const cachedSite = (id: string) => ({ id, likes: 10 })
    queryClient.setQueryData(feedKey, {
      pages: [{ items: [cachedSite('1'), cachedSite('2')], nextCursor: null }],
      pageParams: [undefined],
    })
    queryClient.setQueryData<Partial<IWebsite>[]>(topKey, [cachedSite('1')])
    const seeded = await renderVotes()

    await userEvent.click(likeButton())
    await waitFor(() => expect(likeButton()).not.toBeDisabled())

    const feed = queryClient.getQueryData<{
      pages: { items: { id: string; likes: number }[] }[]
    }>(feedKey)
    expect(feed?.pages[0]?.items).toEqual([
      { id: '1', likes: seeded.likes + 1 },
      { id: '2', likes: 10 },
    ])
    expect(queryClient.getQueryData(topKey)).toEqual([
      { id: '1', likes: seeded.likes + 1 },
    ])
    expect(queryClient.getQueryState(feedKey)?.isInvalidated).toBe(false)
  })

  it('remembers the vote after a reload', async () => {
    await renderVotes()
    await userEvent.click(likeButton())
    await waitFor(() => expect(likeButton()).not.toBeDisabled())

    expect(JSON.parse(localStorage.getItem('nnc-votes') ?? '{}')).toEqual({
      '1': 1,
    })
    expect(localStorage.getItem('nnc-voter')).toMatch(/^[0-9a-f-]{36}$/)
  })

  it('keeps the buttons usable while a vote is sent and sends the latest choice', async () => {
    const sentValues: number[] = []
    let releaseFirst = () => {}
    const firstHeld = new Promise<void>((resolve) => {
      releaseFirst = resolve
    })
    server.use(
      http.post(`${V1_API_URL}/websites/:id/votes`, async ({ request }) => {
        const { value } = (await request.clone().json()) as { value: number }
        sentValues.push(value)
        if (sentValues.length === 1) await firstHeld
      })
    )
    const seeded = await renderVotes()

    await userEvent.click(likeButton())
    expect(likeButton()).not.toBeDisabled()
    await userEvent.click(dislikeButton())
    expect(dislikeButton()).toHaveAttribute('aria-pressed', 'true')
    releaseFirst()

    await waitFor(() => expect(sentValues).toEqual([1, -1]))
    await waitFor(() =>
      expect(localStorage.getItem('nnc-pending-votes')).toBe('{}')
    )
    expect(JSON.parse(localStorage.getItem('nnc-votes') ?? '{}')).toEqual({
      '1': -1,
    })
    expect(dislikeButton()).toHaveTextContent(
      formatCompactNumber(seeded.dislikes + 1)
    )
  })

  it('sends a vote left pending by a previous visit', async () => {
    localStorage.setItem('nnc-pending-votes', JSON.stringify({ '1': 1 }))

    await render(<WebsiteVotes websiteId='1' />)

    await waitFor(() =>
      expect(JSON.parse(localStorage.getItem('nnc-votes') ?? '{}')).toEqual({
        '1': 1,
      })
    )
    expect(localStorage.getItem('nnc-pending-votes')).toBe('{}')
    expect(likeButton()).toHaveAttribute('aria-pressed', 'true')
  })

  it('undoes the vote and says so when it fails', async () => {
    server.use(
      http.post(`${V1_API_URL}/websites/:id/votes`, () =>
        HttpResponse.json(
          { error: { code: 'turnstile_failed', message: 'robô' } },
          { status: 400 }
        )
      )
    )
    await renderVotes()

    await userEvent.click(likeButton())

    expect(
      await screen.findByText(
        'Não foi possível registrar seu voto. Tente de novo.'
      )
    ).toBeInTheDocument()
    expect(likeButton()).toHaveAttribute('aria-pressed', 'false')
  })
})

import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { render } from '@/__tests__/utils.test'
import { mockStats, resetMockMetrics } from '@/__mocks__/data/metrics'
import { server } from '@/__mocks__/node'
import { V1_API_URL } from '@/config/env'
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

  it('remembers the vote after a reload', async () => {
    await renderVotes()
    await userEvent.click(likeButton())
    await waitFor(() => expect(likeButton()).not.toBeDisabled())

    expect(JSON.parse(localStorage.getItem('nnc-votes') ?? '{}')).toEqual({
      '1': 1,
    })
    expect(localStorage.getItem('nnc-voter')).toMatch(/^[0-9a-f-]{36}$/)
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

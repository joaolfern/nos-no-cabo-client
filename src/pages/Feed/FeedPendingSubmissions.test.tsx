import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/__tests__/utils.test'
import {
  MOCK_REVIEW_DELAY_MS,
  createMockSubmission,
  resetMockSubmissions,
} from '@/__mocks__/data/submissions'
import type { IWebsiteSubmission } from '@/interfaces/IWebsite'
import { Feed } from '@/pages/Feed/Feed'
import {
  DRAFT_TTL_MS,
  PENDING_SUBMISSIONS_KEY,
  toPendingSubmission,
  type IPendingSubmission,
} from '@/pages/SubmitWebsite/utils/pendingSubmissions'

const BELL_LABEL = 'Avise-me quando meus sites forem publicados'

const submission: IWebsiteSubmission = {
  url: 'https://meu-rascunho.dev',
  name: 'Meu rascunho',
  description: 'Um rascunho.',
  categories: ['educacao'],
}

function storeDrafts(drafts: IPendingSubmission[]) {
  localStorage.setItem(PENDING_SUBMISSIONS_KEY, JSON.stringify(drafts))
}

function storedDrafts(): IPendingSubmission[] {
  return JSON.parse(localStorage.getItem(PENDING_SUBMISSIONS_KEY) ?? '[]')
}

function draftFor(
  overrides: Partial<IWebsiteSubmission>,
  submittedAt = Date.now()
) {
  const website = createMockSubmission(
    { ...submission, ...overrides },
    submittedAt
  )
  return toPendingSubmission(website)
}

async function firstCard() {
  return (await screen.findAllByTestId('feed-card'))[0]
}

beforeEach(() => {
  localStorage.clear()
  resetMockSubmissions()
})

afterEach(() => {
  Reflect.deleteProperty(window, 'Notification')
})

describe('Feed with pending submissions', () => {
  it('shows a checking draft as the first card, not clickable', async () => {
    storeDrafts([draftFor({})])

    await render(<Feed />)

    const card = await firstCard()
    expect(within(card).getByText('Meu rascunho')).toBeInTheDocument()
    expect(within(card).getByText('Em análise')).toBeInTheDocument()
    expect(
      within(card).queryByRole('link', { name: 'Meu rascunho' })
    ).not.toBeInTheDocument()
  })

  it('ignores expired drafts', async () => {
    storeDrafts([draftFor({}, Date.now() - DRAFT_TTL_MS)])

    await render(<Feed />)

    expect(
      within(await firstCard()).queryByText('Meu rascunho')
    ).not.toBeInTheDocument()
  })

  it('turns the draft into a regular card in its ranked place', async () => {
    storeDrafts([draftFor({}, Date.now() - MOCK_REVIEW_DELAY_MS)])

    await render(<Feed />)

    await waitFor(() => expect(storedDrafts()).toEqual([]))
    const loadMore = screen.queryByRole('button', { name: /Carregar mais/ })
    if (loadMore) await userEvent.click(loadMore)
    const name = await screen.findByText('Meu rascunho')
    const card = name.closest('[data-testid="feed-card"]') as HTMLElement
    expect(within(card).queryByText('Em análise')).not.toBeInTheDocument()
  })

  it('keeps a rejected draft with its reason until dismissed', async () => {
    storeDrafts([
      draftFor(
        { url: 'https://site-rejeitado.dev' },
        Date.now() - MOCK_REVIEW_DELAY_MS
      ),
    ])

    await render(<Feed />)

    expect(
      await screen.findByText('Conteúdo não permitido')
    ).toBeInTheDocument()
    expect(storedDrafts()[0]).toMatchObject({
      status: 'rejected',
      rejectionReason: 'unsafe',
    })

    await userEvent.click(screen.getByRole('button', { name: 'Dispensar' }))

    expect(screen.queryByText('Meu rascunho')).not.toBeInTheDocument()
    expect(storedDrafts()).toEqual([])
  })

  it('asks for notification permission once, then hides the bell on every draft', async () => {
    const notification = {
      permission: 'default',
      requestPermission: vi.fn(async () => {
        notification.permission = 'granted'
        return 'granted'
      }),
    }
    Object.defineProperty(window, 'Notification', {
      configurable: true,
      value: notification,
    })
    storeDrafts([draftFor({}), draftFor({ url: 'https://outro-rascunho.dev' })])

    await render(<Feed />)

    const bells = await screen.findAllByRole('button', { name: BELL_LABEL })
    expect(bells).toHaveLength(2)

    await userEvent.click(bells[0])

    expect(notification.requestPermission).toHaveBeenCalledTimes(1)
    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: BELL_LABEL })
      ).not.toBeInTheDocument()
    )
  })

  it('hides the bell when the browser has no notifications', async () => {
    storeDrafts([draftFor({})])

    await render(<Feed />)

    expect(await screen.findByText('Em análise')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: BELL_LABEL })
    ).not.toBeInTheDocument()
  })

  it('notifies when the review finishes once permission is granted', async () => {
    const notificationSpy = vi.fn()
    Object.defineProperty(window, 'Notification', {
      configurable: true,
      value: Object.assign(notificationSpy, { permission: 'granted' }),
    })
    storeDrafts([draftFor({}, Date.now() - MOCK_REVIEW_DELAY_MS)])

    await render(<Feed />)

    await waitFor(() =>
      expect(notificationSpy).toHaveBeenCalledWith(
        'Meu rascunho foi publicado',
        expect.objectContaining({ tag: expect.stringContaining('nnc-') })
      )
    )
  })
})

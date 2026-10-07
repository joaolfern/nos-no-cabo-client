import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/__mocks__/node'
import { V1_API_URL } from '@/config/env'
import ringSnapshot from '@/pages/LandingPage/data/ringSnapshot.json'
import {
  RING_CACHE_KEY,
  useRingBubbles,
} from '@/pages/LandingPage/hooks/useRingBubbles'
import { RING_CACHE_MAX_AGE_MS } from '@/pages/LandingPage/utils/ringBubbles'

const FRESH_SITE = { id: 'novo', name: 'Novo', faviconUrl: null }

function serveSites() {
  const calls: string[] = []
  server.use(
    http.get(`${V1_API_URL}/websites`, ({ request }) => {
      calls.push(request.url)
      return HttpResponse.json({
        items: [FRESH_SITE],
        nextCursor: null,
        total: 1,
      })
    })
  )
  return calls
}

const storedCache = () =>
  JSON.parse(localStorage.getItem(RING_CACHE_KEY) ?? 'null')

const staleCache = (items: unknown) =>
  JSON.stringify({ fetchedAt: ringSnapshot.fetchedAt - 1, items })

const X_BUBBLES = [
  { id: 'x', title: 'X', url: '/website/x', imageSrc: '/favicon.svg' },
]

beforeEach(() => localStorage.clear())
afterEach(() => vi.restoreAllMocks())

describe('useRingBubbles', () => {
  it('starts from a stale bundled snapshot and refreshes the cache for next time', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(
      ringSnapshot.fetchedAt + RING_CACHE_MAX_AGE_MS + 1
    )
    const calls = serveSites()
    const { result } = renderHook(() => useRingBubbles())

    expect(result.current).toEqual(ringSnapshot.items)
    await waitFor(() =>
      expect(storedCache()?.items).toEqual([
        {
          id: 'novo',
          title: 'Novo',
          url: '/website/novo',
          imageSrc: '/favicon.svg',
        },
      ])
    )
    expect(calls).toHaveLength(1)
    expect(result.current).toEqual(ringSnapshot.items)
  })

  it('uses a fresh cache without any request', async () => {
    const now = ringSnapshot.fetchedAt + 10
    vi.spyOn(Date, 'now').mockReturnValue(now)
    const calls = serveSites()
    localStorage.setItem(
      RING_CACHE_KEY,
      JSON.stringify({ fetchedAt: now, items: X_BUBBLES })
    )

    const { result } = renderHook(() => useRingBubbles())

    expect(result.current).toEqual(X_BUBBLES)
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(calls).toHaveLength(0)
  })

  it('shows a stale cache right away and refreshes it in the background', async () => {
    const now = ringSnapshot.fetchedAt + 2 * RING_CACHE_MAX_AGE_MS
    vi.spyOn(Date, 'now').mockReturnValue(now)
    const calls = serveSites()
    localStorage.setItem(
      RING_CACHE_KEY,
      JSON.stringify({
        fetchedAt: now - RING_CACHE_MAX_AGE_MS - 1,
        items: X_BUBBLES,
      })
    )

    const { result } = renderHook(() => useRingBubbles())

    expect(result.current).toEqual(X_BUBBLES)
    await waitFor(() => expect(calls).toHaveLength(1))
  })

  it('prefers a snapshot newer than the cache', () => {
    vi.spyOn(Date, 'now').mockReturnValue(ringSnapshot.fetchedAt + 1)
    localStorage.setItem(RING_CACHE_KEY, staleCache(X_BUBBLES))

    const { result } = renderHook(() => useRingBubbles())

    expect(result.current).toEqual(ringSnapshot.items)
  })

  it('keeps what it has when the refresh fails', async () => {
    server.use(http.get(`${V1_API_URL}/websites`, () => HttpResponse.error()))
    const { result } = renderHook(() => useRingBubbles())

    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(result.current).toEqual(ringSnapshot.items)
    expect(storedCache()).toBeNull()
  })
})

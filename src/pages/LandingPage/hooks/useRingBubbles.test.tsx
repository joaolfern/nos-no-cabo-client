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

beforeEach(() => localStorage.clear())

describe('useRingBubbles', () => {
  it('starts from the bundled snapshot and refreshes the cache for next time', async () => {
    const calls = serveSites()
    const { result } = renderHook(() => useRingBubbles())

    expect(result.current).toEqual(ringSnapshot)
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
    expect(result.current).toEqual(ringSnapshot)
  })

  it('uses a fresh cache without any request', async () => {
    const calls = serveSites()
    const items = [
      { id: 'x', title: 'X', url: '/website/x', imageSrc: '/favicon.svg' },
    ]
    localStorage.setItem(
      RING_CACHE_KEY,
      JSON.stringify({ fetchedAt: Date.now(), items })
    )

    const { result } = renderHook(() => useRingBubbles())

    expect(result.current).toEqual(items)
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(calls).toHaveLength(0)
  })

  it('shows a stale cache right away and refreshes it in the background', async () => {
    const calls = serveSites()
    const items = [
      { id: 'x', title: 'X', url: '/website/x', imageSrc: '/favicon.svg' },
    ]
    localStorage.setItem(
      RING_CACHE_KEY,
      JSON.stringify({
        fetchedAt: Date.now() - RING_CACHE_MAX_AGE_MS - 1,
        items,
      })
    )

    const { result } = renderHook(() => useRingBubbles())

    expect(result.current).toEqual(items)
    await waitFor(() => expect(calls).toHaveLength(1))
  })

  it('keeps what it has when the refresh fails', async () => {
    server.use(http.get(`${V1_API_URL}/websites`, () => HttpResponse.error()))
    const { result } = renderHook(() => useRingBubbles())

    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(result.current).toEqual(ringSnapshot)
    expect(storedCache()).toBeNull()
  })
})

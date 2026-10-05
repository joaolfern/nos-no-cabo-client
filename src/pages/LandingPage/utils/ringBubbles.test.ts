import {
  RING_CACHE_MAX_AGE_MS,
  isRingCache,
  isStale,
  toBubbles,
} from '@/pages/LandingPage/utils/ringBubbles'

const NOW = Date.UTC(2026, 9, 5, 12)

describe('toBubbles', () => {
  it('turns published sites into bubbles that open their page', () => {
    expect(
      toBubbles([
        { id: 'a', name: 'Alfa', faviconUrl: 'https://a.dev/icon.png' },
        { id: 'b', name: 'Beta', faviconUrl: null },
      ])
    ).toEqual([
      {
        id: 'a',
        title: 'Alfa',
        url: '/website/a',
        imageSrc: 'https://a.dev/icon.png',
      },
      { id: 'b', title: 'Beta', url: '/website/b', imageSrc: '/favicon.svg' },
    ])
  })
})

describe('ring cache', () => {
  const cache = {
    fetchedAt: NOW,
    items: toBubbles([{ id: 'a', name: 'Alfa', faviconUrl: null }]),
  }

  it('accepts only well-formed caches', () => {
    expect(isRingCache(cache)).toBe(true)
    expect(isRingCache({ fetchedAt: NOW, items: [] })).toBe(false)
    expect(isRingCache({ fetchedAt: 'ontem', items: cache.items })).toBe(false)
    expect(isRingCache({ fetchedAt: NOW, items: [{ id: 1 }] })).toBe(false)
    expect(isRingCache(null)).toBe(false)
  })

  it('is stale after a day', () => {
    expect(isStale(cache, NOW + RING_CACHE_MAX_AGE_MS - 1)).toBe(false)
    expect(isStale(cache, NOW + RING_CACHE_MAX_AGE_MS + 1)).toBe(true)
    expect(isStale(null, NOW)).toBe(true)
  })
})

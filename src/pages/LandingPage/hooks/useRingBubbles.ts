import { useEffect, useState } from 'react'
import { v1Api } from '@/api/api'
import { useLocalStorageJson } from '@/hooks/useLocalStorageJson'
import type { ISubmittedWebsite } from '@/interfaces/IWebsite'
import ringSnapshot from '@/pages/LandingPage/data/ringSnapshot.json'
import {
  type RingCache,
  isRingCache,
  isStale,
  toBubbles,
} from '@/pages/LandingPage/utils/ringBubbles'
import type { WebsiteBubbleProps } from '@/pages/Website/components/WebsiteBubble/WebsiteBubble.types'

export const RING_CACHE_KEY = 'nnc-ring-bubbles'
const RING_SAMPLE_SIZE = 48

const isCacheOrEmpty = (value: unknown): value is RingCache | null =>
  value === null || isRingCache(value)

// The first paint never waits: it uses the cache or the build-time snapshot, and a stale
// cache is refreshed in the background for the next visit.
export function useRingBubbles(): WebsiteBubbleProps[] {
  const [cache, setCache] = useLocalStorageJson<RingCache | null>(
    RING_CACHE_KEY,
    null,
    isCacheOrEmpty
  )
  const [items] = useState(() => cache?.items ?? ringSnapshot)

  useEffect(() => {
    if (!isStale(cache, Date.now())) return

    v1Api
      .get<{ items: ISubmittedWebsite[] }>('websites', {
        params: { sort: 'melhores', limit: RING_SAMPLE_SIZE },
      })
      .then(({ data }) => {
        const bubbles = toBubbles(data.items)
        if (bubbles.length > 0)
          setCache({ fetchedAt: Date.now(), items: bubbles })
      })
      .catch(() => {})
  }, [cache, setCache])

  return items
}

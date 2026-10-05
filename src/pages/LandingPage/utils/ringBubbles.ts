import type { ISubmittedWebsite } from '@/interfaces/IWebsite'
import {
  BUBBLE_FALLBACK_IMAGE,
  type WebsiteBubbleProps,
} from '@/pages/Website/components/WebsiteBubble/WebsiteBubble.types'

export const RING_CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000

export type RingCache = { fetchedAt: number; items: WebsiteBubbleProps[] }

type RingSite = Pick<ISubmittedWebsite, 'id' | 'name' | 'faviconUrl'>

export function toBubbles(sites: RingSite[]): WebsiteBubbleProps[] {
  return sites.map((site) => ({
    id: site.id,
    title: site.name,
    url: `/website/${site.id}`,
    imageSrc: site.faviconUrl ?? BUBBLE_FALLBACK_IMAGE,
  }))
}

const isBubble = (value: unknown): value is WebsiteBubbleProps => {
  const bubble = value as Partial<WebsiteBubbleProps> | null
  return (
    typeof bubble?.id === 'string' &&
    typeof bubble.title === 'string' &&
    typeof bubble.url === 'string' &&
    typeof bubble.imageSrc === 'string'
  )
}

export function isRingCache(value: unknown): value is RingCache {
  const cache = value as Partial<RingCache> | null
  return (
    typeof cache?.fetchedAt === 'number' &&
    Array.isArray(cache.items) &&
    cache.items.length > 0 &&
    cache.items.every(isBubble)
  )
}

export function isStale(cache: RingCache | null, now: number) {
  return !cache || now - cache.fetchedAt > RING_CACHE_MAX_AGE_MS
}

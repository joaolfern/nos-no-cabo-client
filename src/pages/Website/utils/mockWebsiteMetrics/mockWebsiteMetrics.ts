import type { IWebsite } from '@/interfaces/IWebsite'

export interface IWebsiteMetric {
  id: string
  value: number
  description: string
  display: 'counter' | 'number'
}

// Deterministic per-id pseudo-random int, so the same website always shows
// the same numbers instead of reshuffling on every render.
function seededInt(seed: string, salt: number, min: number, max: number) {
  let hash = 2166136261 ^ salt
  for (const char of seed) {
    hash = Math.imul(hash ^ char.charCodeAt(0), 16777619)
  }
  hash = Math.imul(hash ^ (hash >>> 15), 2246822507)
  hash ^= hash >>> 13
  const normalized = (hash >>> 0) / 4294967296
  return Math.floor(min + normalized * (max - min))
}

// No voting backend yet: a stable placeholder count per website.
export function mockWebsiteLikes(websiteId: string) {
  return seededInt(websiteId, 4, 0, 150)
}

export function mockWebsiteClicks(websiteId: string) {
  return {
    total: seededInt(websiteId, 1, 800, 12000),
    recent: seededInt(websiteId, 2, 40, 900),
  }
}

// Placeholder metrics shell: no analytics backend exists yet, so these are
// mocked from the website id. Real subsections can replace/extend this list
// once that data exists, without touching how WebsiteMetrics renders it.
export function buildMockWebsiteMetrics(website: IWebsite): IWebsiteMetric[] {
  return [
    {
      id: 'visits',
      value: mockWebsiteClicks(website.id).total,
      description: 'visitas desde a entrada na aliança',
      display: 'counter',
    },
    {
      id: 'last-month',
      value: mockWebsiteClicks(website.id).recent,
      description: 'visitas no último mês',
      display: 'number',
    },
    {
      id: 'redirects',
      value: seededInt(website.id, 3, 200, 3000),
      description: 'redirecionamentos para a aliança',
      display: 'number',
    },
  ]
}

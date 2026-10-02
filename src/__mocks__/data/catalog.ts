import type {
  CategoryList,
  Page,
  ParsedWebsiteListQuery,
  Website,
  WebsiteNeighbours,
} from '@nosnocabo/contract'
import { CATEGORY_SLUGS } from '@nosnocabo/contract'
import { rankWebsites } from '@/__mocks__/data/ranking'
import {
  fromPublishedWebsite,
  getPublishedMockSubmissions,
} from '@/__mocks__/data/submissions'
import { MOCK_WEBSITES } from '@/__mocks__/data/websites'
import type { IWebsite } from '@/interfaces/IWebsite'
import { mockWebsiteLikes } from '@/pages/Website/utils/mockWebsiteMetrics/mockWebsiteMetrics'

// The mock catalog: the same filters, sorts and paging as the real /v1 list.

const verifiedAtById = new Map<string, string>()

export function markMockVerified(id: string, verifiedAt: string) {
  verifiedAtById.set(id, verifiedAt)
}

export function withMockVerification<
  T extends { id: string; verifiedAt?: string | null },
>(website: T): T {
  const verifiedAt = verifiedAtById.get(website.id)
  return verifiedAt ? { ...website, verifiedAt } : website
}

function publishedWebsites(): IWebsite[] {
  return [...getPublishedMockSubmissions(), ...MOCK_WEBSITES].map(
    withMockVerification
  )
}

const searchKey = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

const byDateDesc = (a: IWebsite, b: IWebsite) =>
  Date.parse(b.createdAt) - Date.parse(a.createdAt)

const SORTS: Record<
  ParsedWebsiteListQuery['sort'],
  (websites: IWebsite[]) => IWebsite[]
> = {
  melhores: rankWebsites,
  recentes: (websites) => [...websites].sort(byDateDesc),
  curtidos: (websites) =>
    [...websites].sort(
      (a, b) => mockWebsiteLikes(b.id) - mockWebsiteLikes(a.id)
    ),
  az: (websites) =>
    [...websites].sort((a, b) =>
      a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
    ),
}

export function listMockWebsites(
  query: Omit<ParsedWebsiteListQuery, 'limit'> & { limit: number }
): Page<Website> {
  const q = query.q ? searchKey(query.q.trim()) : ''
  const matching = publishedWebsites().filter(
    (website) =>
      (!query.categoria ||
        website.keywords.some(({ name }) => name === query.categoria)) &&
      (!q || searchKey(`${website.name} ${website.description}`).includes(q))
  )
  const sorted = SORTS[query.sort](matching)
  const offset = Number(query.cursor ?? 0)
  const items = sorted.slice(offset, offset + query.limit)
  const nextOffset = offset + items.length

  return {
    items: items.map(fromPublishedWebsite),
    nextCursor: nextOffset < sorted.length ? String(nextOffset) : null,
    total: sorted.length,
  }
}

export function mockCategories(): CategoryList {
  const websites = publishedWebsites()

  return {
    total: websites.length,
    items: CATEGORY_SLUGS.map((slug) => ({
      slug,
      count: websites.filter((website) =>
        website.keywords.some(({ name }) => name === slug)
      ).length,
    })),
  }
}

// Ring order: verified first, then by publication date. It wraps around.
export function mockNeighbours(id: string): WebsiteNeighbours | null {
  const ring = publishedWebsites().sort(
    (a, b) =>
      Number(!a.verifiedAt) - Number(!b.verifiedAt) ||
      Date.parse(a.createdAt) - Date.parse(b.createdAt)
  )
  const index = ring.findIndex((website) => website.id === id)
  if (index === -1) return null
  if (ring.length < 2) return { previous: null, next: null, random: null }

  const at = (position: number) =>
    fromPublishedWebsite(ring[(position + ring.length) % ring.length])
  const others = ring.filter((website) => website.id !== id)

  return {
    previous: at(index - 1),
    next: at(index + 1),
    random: fromPublishedWebsite(
      others[Math.floor(Math.random() * others.length)]
    ),
  }
}

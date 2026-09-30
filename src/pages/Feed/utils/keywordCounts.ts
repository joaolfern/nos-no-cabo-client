import type { IWebsite } from '@/interfaces/IWebsite'

export function countWebsitesByKeyword(websites: IWebsite[] = []) {
  const counts = new Map<string, number>()

  websites.forEach((website) => {
    const keywordIds = new Set(website.keywords.map((keyword) => keyword.id))

    keywordIds.forEach((id) => counts.set(id, (counts.get(id) ?? 0) + 1))
  })

  return counts
}

export function sortByCountDesc<T extends { value: string }>(
  options: T[],
  counts: Map<string, number>
): T[] {
  return [...options].sort(
    (a, b) => (counts.get(b.value) ?? 0) - (counts.get(a.value) ?? 0)
  )
}

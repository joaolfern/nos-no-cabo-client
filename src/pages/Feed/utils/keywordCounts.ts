import type { CategoryList } from '@nosnocabo/contract'

export function countsBySlug(categories: CategoryList | undefined) {
  return new Map<string, number>(
    categories?.items.map(({ slug, count }) => [slug, count])
  )
}

export function sortByCountDesc<T extends { value: string }>(
  options: T[],
  counts: Map<string, number>
): T[] {
  return [...options].sort(
    (a, b) => (counts.get(b.value) ?? 0) - (counts.get(a.value) ?? 0)
  )
}

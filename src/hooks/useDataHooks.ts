import type {
  CategoryList,
  Page,
  Website,
  WebsitePage,
} from '@nosnocabo/contract'
import { useQuery } from '@tanstack/react-query'
import { v1Api } from '@/api/api'
import { fromApiWebsite } from '@/pages/Feed/utils/fromApiWebsite'

// Every query about published sites starts with 'websites', so one invalidation refreshes them all.
export const websitePageKey = (id: string) => ['websites', 'page', id]

// The website page's details, neighbours and stats come from one request (see the gateway).
export const websitePageQuery = (id: string) => ({
  queryKey: websitePageKey(id),
  queryFn: () =>
    v1Api.get<WebsitePage>(`websites/${id}/page`).then((res) => res.data),
})

export function useWebsiteDetailsData(id: string) {
  return useQuery({
    ...websitePageQuery(id),
    select: (page) => fromApiWebsite(page.website),
  })
}

export function useCategoriesData() {
  return useQuery({
    queryKey: ['websites', 'categories'],
    queryFn: () =>
      v1Api.get<CategoryList>('categories').then((res) => res.data),
  })
}

export function useNeighboursData(id: string) {
  return useQuery({
    ...websitePageQuery(id),
    select: ({ neighbours }) => ({
      previous: neighbours.previous && fromApiWebsite(neighbours.previous),
      next: neighbours.next && fromApiWebsite(neighbours.next),
      random: neighbours.random && fromApiWebsite(neighbours.random),
    }),
  })
}

export function useTopWebsitesData(limit: number) {
  return useQuery({
    queryKey: ['websites', 'top', limit],
    queryFn: () =>
      v1Api
        .get<Page<Website>>('websites', { params: { sort: 'melhores', limit } })
        .then((res) => res.data.items.map(fromApiWebsite)),
  })
}

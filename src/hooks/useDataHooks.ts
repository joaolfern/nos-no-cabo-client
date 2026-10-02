import type {
  CategoryList,
  Page,
  Website,
  WebsiteNeighbours,
} from '@nosnocabo/contract'
import { useQuery } from '@tanstack/react-query'
import { openLibraryApi, v1Api } from '@/api/api'
import type { IOpenLibraryResponse } from '@/interfaces/IBook'
import { ENABLE_OPEN_LIBRARY_API } from '@/config/env'
import { fromApiWebsite } from '@/pages/Feed/utils/fromApiWebsite'

// Every query about published sites starts with 'websites', so one invalidation refreshes them all.
export function useWebsiteDetailsData(id: string) {
  return useQuery({
    queryKey: ['websites', 'details', id],
    queryFn: () =>
      v1Api
        .get<Website>(`websites/${id}`)
        .then((res) => fromApiWebsite(res.data)),
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
    queryKey: ['websites', 'neighbours', id],
    queryFn: () =>
      v1Api
        .get<WebsiteNeighbours>(`websites/${id}/neighbours`)
        .then(({ data }) => ({
          previous: data.previous && fromApiWebsite(data.previous),
          next: data.next && fromApiWebsite(data.next),
          random: data.random && fromApiWebsite(data.random),
        })),
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

export const RECOMMENDED_BOOKS_LIMIT = 3

export function useRecommendedBooks(subject: string | undefined) {
  return useQuery({
    enabled: ENABLE_OPEN_LIBRARY_API && !!subject,
    queryKey: ['recommendedBooks', subject],
    retry: false,
    refetchOnWindowFocus: false,

    queryFn: () =>
      openLibraryApi
        .get<IOpenLibraryResponse>(
          `subjects/${subject}.json?limit=${RECOMMENDED_BOOKS_LIMIT}`
        )
        .then((res) => res.data),
  })
}

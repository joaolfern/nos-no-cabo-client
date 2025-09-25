import { api, openLibraryApi } from '@/api/api'
import type { IAuthor } from '@/interfaces/IAuthor'
import { useQuery } from '@tanstack/react-query'
import type { IKeyword, IWebsite } from '@/interfaces/IWebsite'
import type { IOpenLibraryResponse } from '@/interfaces/IBook'
import { ENABLE_OPEN_LIBRARY_API } from '@/config/env'

export function useWebsiteDetailsData(id: string) {
  return useQuery({
    queryKey: [{ type: 'websiteDetails', id }],
    queryFn: () =>
      api.get<IWebsite[]>(`websiteDetails/${id}`).then((res) => res.data ?? []),
  })
}

export function useWebsitesData() {
  return useQuery({
    queryKey: ['websites'],
    queryFn: () =>
      api.get<IWebsite[]>('websites').then((res) => res.data ?? []),
  })
}

export function useAuthorsData() {
  return useQuery({
    queryKey: ['authors'],
    queryFn: () => api.get<IAuthor[]>('authors').then((res) => res.data ?? []),
  })
}

export function useKeywordsData() {
  return useQuery({
    queryKey: ['keywords'],
    queryFn: () =>
      api.get<IKeyword[]>('keywords').then((res) => res.data ?? []),
  })
}

export function useAuthorData(id: string) {
  return useQuery({
    queryKey: ['author', id],
    queryFn: () => api.get<IAuthor>(`authors/${id}`).then((res) => res.data),
    enabled: !!id,
  })
}

export function useKeywordData(id: string) {
  return useQuery({
    queryKey: ['keyword', id],
    queryFn: () => api.get<IKeyword>(`keywords/${id}`).then((res) => res.data),
    enabled: !!id,
  })
}

export function useRecommendedBooks(keywords: IKeyword[]) {
  return useQuery({
    enabled: ENABLE_OPEN_LIBRARY_API,
    queryKey: ['recommendedBooks', keywords],
    queryFn: () =>
      openLibraryApi
        .get<IOpenLibraryResponse>(`subjects/${keywords[0].name}.json?limit=3`)
        .then((res) => res.data ?? []),
  })
}

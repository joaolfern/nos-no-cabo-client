import { api, openLibraryApi } from '@/api/api'
import type { IAuthor } from '@/interfaces/IAuthor'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import type { IKeyword, IWebsite } from '@/interfaces/IWebsite'
import type { IOpenLibraryResponse } from '@/interfaces/IBook'
import { ENABLE_OPEN_LIBRARY_API } from '@/config/env'

export function useWebsiteDetailsData(id: string) {
  return useQuery({
    queryKey: [{ type: 'websiteDetails', id }],
    queryFn: () =>
      api.get<IWebsite[]>(`website/${id}`).then((res) => res.data ?? []),
  })
}

export function useWebsitesData() {
  return useQuery({
    queryKey: ['websites'],
    queryFn: () =>
      api.get<IWebsite[]>('websites').then((res) => res.data ?? []),
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
        .then((res) => res.data ?? []),
  })
}

export function useReportWebsite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { id: string }) => api.delete(`website/${data.id}`),
    mutationKey: ['websites'],
    onMutate: async (data: { id: string }) => {
      await Promise.resolve()
      const previousWebsites = queryClient.getQueryData<IWebsite[]>([
        'websites',
      ])

      queryClient.setQueryData<IWebsite[]>(['websites'], (old = []) =>
        old.filter((website) => website.id !== data.id)
      )

      return { previousWebsites }
    },
    onError: (_err, _data, context) => {
      if (context?.previousWebsites) {
        queryClient.setQueryData(['websites'], context.previousWebsites)
      }
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['websites'] })
      queryClient.invalidateQueries({
        queryKey: [{ type: 'websiteDetails', id: data.id }],
      })
      queryClient.invalidateQueries({ queryKey: ['keywords'] })
    },
  })
}

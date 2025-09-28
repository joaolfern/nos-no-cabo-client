import { api, openLibraryApi } from '@/api/api'
import type { IAuthor } from '@/interfaces/IAuthor'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import type {
  IRegisterWebsite,
  IKeyword,
  IPreregisterWebsite,
  IWebsite,
} from '@/interfaces/IWebsite'
import type { IOpenLibraryResponse } from '@/interfaces/IBook'
import { ENABLE_OPEN_LIBRARY_API } from '@/config/env'
import { parseRegisterDataToWebsite } from '@/__mocks__/data/parseRegisterDataToWebsite'

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

export function useRecommendedBooks(keywords: IKeyword[]) {
  return useQuery({
    enabled: ENABLE_OPEN_LIBRARY_API,
    queryKey: ['recommendedBooks', keywords],
    retry: false,
    refetchOnWindowFocus: false,

    queryFn: () =>
      openLibraryApi
        .get<IOpenLibraryResponse>(
          `subjects/${keywords[0].name.replace(' ', '_')}.json?limit=3`
        )
        .then((res) => res.data ?? []),
  })
}

export function usePreregisterWebsite() {
  return useMutation({
    mutationFn: (data: { url: string }) =>
      api
        .post<IPreregisterWebsite>('website', {
          url: `https://${data.url.replace(/^https?:\/\//, '')}`,
        })
        .then((res) => res.data),
  })
}

export function useRegisterWebsite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: IRegisterWebsite) =>
      api.patch(`website`, data).then((res) => res.data),
    mutationKey: ['websites'],
    onMutate: async (newWebsite: IRegisterWebsite) => {
      await Promise.resolve()
      const previousWebsites = queryClient.getQueryData<IWebsite[]>([
        'websites',
      ])

      const newWebsiteComplete: IWebsite =
        parseRegisterDataToWebsite(newWebsite)

      queryClient.setQueryData<IWebsite[]>(['websites'], (old = []) => [
        ...old,
        newWebsiteComplete,
      ])

      const previousKeywords = queryClient.getQueryData<IKeyword[]>([
        'keywords',
      ])

      queryClient.setQueryData<IKeyword[]>(['keywords'], (old = []) => [
        ...old,
        ...newWebsiteComplete.keywords.filter(
          (kw) => !old.find((o) => o.id === kw.id)
        ),
      ])

      return { previousWebsites, previousKeywords }
    },
    onError: (_err, _newWebsite, context) => {
      if (context?.previousWebsites) {
        queryClient.setQueryData(['websites'], context.previousWebsites)
      }
      if (context?.previousKeywords) {
        queryClient.setQueryData(['keywords'], context.previousKeywords)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['websites'] })
      queryClient.invalidateQueries({ queryKey: ['keywords'] })
    },
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

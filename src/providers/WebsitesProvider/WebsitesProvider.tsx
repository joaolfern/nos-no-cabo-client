import type { Page, Website } from '@nosnocabo/contract'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useCallback, useMemo, type ReactNode } from 'react'
import { v1Api } from '@/api/api'
import { WebsitesContext } from '@/contexts/WebsitesContext'
import type { IWebsitesContext } from '@/interfaces/IWebsite'
import { useFeedPageSize } from '@/pages/Feed/hooks/useFeedPageSize'
import { useFilters } from '@/pages/Feed/hooks/useFilters'
import { useSort } from '@/pages/Feed/hooks/useSort'
import { fromApiWebsite } from '@/pages/Feed/utils/fromApiWebsite'

type WebsitesProviderProps = {
  children: ReactNode
}

// The feed: one server page at a time, filtered and sorted by the API.
export function WebsitesProvider({ children }: WebsitesProviderProps) {
  const { selectedSort } = useSort()
  const { selectedKeywords, search } = useFilters()
  const pageSize = useFeedPageSize()
  const params = {
    sort: selectedSort,
    categoria: selectedKeywords[0],
    q: search.trim() || undefined,
    limit: pageSize,
  }

  const query = useInfiniteQuery({
    queryKey: ['websites', 'list', params],
    queryFn: ({ pageParam }) =>
      v1Api
        .get<Page<Website>>('websites', {
          params: { ...params, cursor: pageParam },
        })
        .then((res) => res.data),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  })

  const websites = useMemo(
    () =>
      query.data?.pages.flatMap((page) => page.items.map(fromApiWebsite)) ?? [],
    [query.data]
  )

  const getWebsiteById = useCallback(
    (id: string) => websites.find((website) => website.id === id),
    [websites]
  )

  const { fetchNextPage } = query
  const loadMore = useCallback(() => {
    fetchNextPage()
  }, [fetchNextPage])

  const value = useMemo<IWebsitesContext>(
    () => ({
      websites,
      total: query.data?.pages[0]?.total,
      isLoading: query.isLoading,
      error: query.error,
      hasMore: query.hasNextPage,
      isLoadingMore: query.isFetchingNextPage,
      loadMore,
      pageSize,
      getWebsiteById,
    }),
    [
      websites,
      query.data,
      query.isLoading,
      query.error,
      query.hasNextPage,
      query.isFetchingNextPage,
      loadMore,
      pageSize,
      getWebsiteById,
    ]
  )

  return (
    <WebsitesContext.Provider value={value}>
      {children}
    </WebsitesContext.Provider>
  )
}

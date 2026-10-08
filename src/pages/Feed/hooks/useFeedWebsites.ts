import type { Page, Website } from '@nosnocabo/contract'
import { useInfiniteQuery } from '@tanstack/react-query'
import { v1Api } from '@/api/api'
import { useCategoriesData } from '@/hooks/useDataHooks'
import { FEED_LIST_KEY } from '@/pages/Feed/utils/feedCache'
import { useFeedPageSize } from '@/pages/Feed/hooks/useFeedPageSize'
import { useFilters } from '@/pages/Feed/hooks/useFilters'
import { useSort } from '@/pages/Feed/hooks/useSort'
import { fromApiWebsite } from '@/pages/Feed/utils/fromApiWebsite'

// The feed: one server page at a time, filtered and sorted by the API. Only the feed calls it,
// so other pages never fetch the list or the categories.
export function useFeedWebsites() {
  const { selectedSort } = useSort()
  const { selectedKeywords, search } = useFilters()
  const pageSize = useFeedPageSize()
  useCategoriesData()

  const params = {
    sort: selectedSort,
    categoria: selectedKeywords[0],
    q: search.trim() || undefined,
    limit: pageSize,
  }

  const {
    data,
    isLoading,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: [...FEED_LIST_KEY, params],
    queryFn: ({ pageParam }) =>
      v1Api
        .get<Page<Website>>('websites', {
          params: { ...params, cursor: pageParam },
        })
        .then((res) => res.data),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  })

  return {
    websites:
      data?.pages.flatMap((page) => page.items.map(fromApiWebsite)) ?? [],
    total: data?.pages[0]?.total,
    isLoading,
    error,
    hasMore: hasNextPage,
    isLoadingMore: isFetchingNextPage,
    loadMore: () => {
      fetchNextPage()
    },
    pageSize,
  }
}

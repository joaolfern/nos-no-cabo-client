import type { Page, Website } from '@nosnocabo/contract'
import type { InfiniteData, QueryClient } from '@tanstack/react-query'
import type { IWebsite } from '@/interfaces/IWebsite'
import { fromApiWebsite } from '@/pages/Feed/utils/fromApiWebsite'

export const FEED_LIST_KEY = ['websites', 'list']

// A site the feed already loaded, so its page can render before its own request returns.
export function findFeedWebsite(
  queryClient: QueryClient,
  id: string
): IWebsite | undefined {
  const lists = queryClient.getQueriesData<InfiniteData<Page<Website>>>({
    queryKey: FEED_LIST_KEY,
  })
  for (const [, list] of lists) {
    const found = list?.pages
      .flatMap((page) => page.items)
      .find((website) => website.id === id)
    if (found) return fromApiWebsite(found)
  }
  return undefined
}

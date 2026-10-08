import type { Page, Website } from '@nosnocabo/contract'
import {
  type InfiniteData,
  type QueryClient,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { v1Api } from '@/api/api'
import { turnstileHeaders } from '@/api/turnstile'
import type { IApiError } from '@/interfaces/IApiError'
import type { IWebsite } from '@/interfaces/IWebsite'
import type {
  IVoteValue,
  IWebsitePage,
  IWebsiteStats,
} from '@/interfaces/IWebsiteStats'
import { websitePageKey } from '@/hooks/useDataHooks'
import { FEED_LIST_KEY } from '@/pages/Feed/utils/feedCache'
import {
  clearPendingVote,
  getPendingVote,
  getVoterId,
  storeVote,
} from '@/pages/Website/utils/voterStorage'

type VoteInput = {
  value: IVoteValue
  turnstileToken: string | null
}

function withLikes<T extends { id: string; likes?: number }>(
  website: T,
  websiteId: string,
  likes: number
) {
  return website.id === websiteId ? { ...website, likes } : website
}

// The feed and the top list are cached; patching them avoids a refetch when going back.
function updateCachedLikes(
  queryClient: QueryClient,
  websiteId: string,
  netLikes: number
) {
  queryClient.setQueriesData<InfiniteData<Page<Website>>>(
    { queryKey: FEED_LIST_KEY },
    (feed) =>
      feed && {
        ...feed,
        pages: feed.pages.map((page) => ({
          ...page,
          items: page.items.map((item) => withLikes(item, websiteId, netLikes)),
        })),
      }
  )
  queryClient.setQueriesData<IWebsite[]>(
    { queryKey: ['websites', 'top'] },
    (top) => top?.map((website) => withLikes(website, websiteId, netLikes))
  )
}

export function useVoteWebsite(websiteId: string) {
  const queryClient = useQueryClient()

  return useMutation<IWebsiteStats, IApiError, VoteInput>({
    mutationFn: ({ value, turnstileToken }) =>
      v1Api
        .post<IWebsiteStats>(
          `websites/${websiteId}/votes`,
          { voterId: getVoterId(), value },
          {
            headers: turnstileHeaders(turnstileToken),
            adapter: 'fetch',
            fetchOptions: { keepalive: true },
          }
        )
        .then((res) => res.data),
    onSuccess: (stats, { value }) => {
      storeVote(websiteId, value)
      queryClient.setQueryData<IWebsitePage>(
        websitePageKey(websiteId),
        (page) => page && { ...page, stats }
      )
      updateCachedLikes(queryClient, websiteId, stats.likes - stats.dislikes)
    },
    onSettled: (_stats, _error, { value }) => {
      if (getPendingVote(websiteId) === value) clearPendingVote(websiteId)
    },
  })
}

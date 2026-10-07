import { useMutation, useQueryClient } from '@tanstack/react-query'
import { v1Api } from '@/api/api'
import { turnstileHeaders } from '@/api/turnstile'
import type { IApiError } from '@/interfaces/IApiError'
import type {
  IVoteValue,
  IWebsitePage,
  IWebsiteStats,
} from '@/interfaces/IWebsiteStats'
import { websitePageKey } from '@/hooks/useDataHooks'
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
    },
    onSettled: (_stats, _error, { value }) => {
      if (getPendingVote(websiteId) === value) clearPendingVote(websiteId)
    },
  })
}

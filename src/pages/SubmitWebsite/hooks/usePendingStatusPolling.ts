import { useEffect, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/api'
import { useNotificationPermission } from '@/hooks/useNotificationPermission'
import type { IWebsiteStatus } from '@/interfaces/IWebsite'
import { usePendingSubmissions } from '@/pages/SubmitWebsite/hooks/usePendingSubmissions'
import {
  ACTIVE_CHECK_INTERVAL_MS,
  RETURN_CHECK_MIN_INTERVAL_MS,
  isInActiveCheckWindow,
  reconcileDrafts,
  rejectionMessage,
  type IPendingSubmission,
} from '@/pages/SubmitWebsite/utils/pendingSubmissions'

function notifyOutcome(draft: IPendingSubmission, isPublished: boolean) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return
  }

  // The tag makes a second tab or a repeated check replace, not duplicate, it.
  new Notification(
    isPublished
      ? `${draft.name} foi publicado`
      : `${draft.name} não foi aceito`,
    {
      tag: `nnc-submission-${draft.id}`,
      body: isPublished
        ? 'Já aparece no feed do Nós no Cabo.'
        : rejectionMessage(draft.rejectionReason),
    }
  )
}

// Checks every checking draft in one request: every 15 s during the first
// 2 minutes, then only on page load or tab focus (at most once a minute).
export function usePendingStatusPolling() {
  const { drafts, updateDrafts, removeDrafts } = usePendingSubmissions()
  const queryClient = useQueryClient()

  const checking = useMemo(
    () => drafts.filter((draft) => draft.status === 'checking'),
    [drafts]
  )
  const ids = checking.map((draft) => draft.id)
  const { permission } = useNotificationPermission()

  const { data: statuses } = useQuery({
    queryKey: ['websiteStatuses', ids],
    queryFn: () =>
      api
        .get<IWebsiteStatus[]>('v1/websites/status', {
          params: { ids: ids.join(',') },
        })
        .then((res) => res.data),
    enabled: ids.length > 0,
    staleTime: RETURN_CHECK_MIN_INTERVAL_MS,
    refetchOnWindowFocus: true,
    refetchInterval: () =>
      checking.some((draft) => isInActiveCheckWindow(draft, Date.now()))
        ? ACTIVE_CHECK_INTERVAL_MS
        : false,
    refetchIntervalInBackground: permission === 'granted',
  })

  useEffect(() => {
    if (!statuses) return

    const { published, rejected } = reconcileDrafts(checking, statuses)

    if (published.length > 0) {
      removeDrafts(published.map((draft) => draft.id))
      queryClient.invalidateQueries({ queryKey: ['websites'] })
    }
    if (rejected.length > 0) updateDrafts(rejected)

    published.forEach((draft) => notifyOutcome(draft, true))
    rejected.forEach((draft) => notifyOutcome(draft, false))
  }, [statuses, checking, removeDrafts, updateDrafts, queryClient])
}

import { useMemo } from 'react'
import type { FeedPendingItem } from '@/pages/Feed/components/FeedCardList/FeedCardList'
import { DraftStatus } from '@/pages/SubmitWebsite/components/DraftStatus/DraftStatus'
import { usePendingStatusPolling } from '@/pages/SubmitWebsite/hooks/usePendingStatusPolling'
import { usePushSubscription } from '@/pages/SubmitWebsite/hooks/usePushSubscription'
import { usePendingSubmissions } from '@/pages/SubmitWebsite/hooks/usePendingSubmissions'
import { draftToWebsite } from '@/pages/SubmitWebsite/utils/pendingSubmissions'

// The submitter's drafts as the first items of the feed, kept up to date.
export function usePendingFeedItems(): FeedPendingItem[] {
  const { drafts, removeDrafts } = usePendingSubmissions()
  usePendingStatusPolling()
  usePushSubscription()

  return useMemo(
    () =>
      drafts.map((draft) => ({
        website: draftToWebsite(draft),
        tone: draft.status === 'rejected' ? 'rejected' : 'draft',
        status: (
          <DraftStatus
            draft={draft}
            onDismiss={() => removeDrafts([draft.id])}
          />
        ),
      })),
    [drafts, removeDrafts]
  )
}

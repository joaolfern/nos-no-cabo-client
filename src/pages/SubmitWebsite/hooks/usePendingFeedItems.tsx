import { useMemo } from 'react'
import type { FeedPendingItem } from '@/pages/Feed/components/FeedCardList/FeedCardList'
import { DraftStatus } from '@/pages/SubmitWebsite/components/DraftStatus/DraftStatus'
import { PublishedStatus } from '@/pages/SubmitWebsite/components/PublishedStatus/PublishedStatus'
import { usePendingStatusPolling } from '@/pages/SubmitWebsite/hooks/usePendingStatusPolling'
import { usePushSubscription } from '@/pages/SubmitWebsite/hooks/usePushSubscription'
import { usePendingSubmissions } from '@/pages/SubmitWebsite/hooks/usePendingSubmissions'
import { usePublishedThisSession } from '@/pages/SubmitWebsite/hooks/usePublishedThisSession'
import { draftToWebsite } from '@/pages/SubmitWebsite/utils/pendingSubmissions'

// The submitter's just-published sites and drafts as the first items of the feed.
export function usePendingFeedItems(): FeedPendingItem[] {
  const { drafts, removeDrafts } = usePendingSubmissions()
  const { published } = usePublishedThisSession()
  usePendingStatusPolling()
  usePushSubscription()

  return useMemo(
    () => [
      ...published.map((website): FeedPendingItem => ({
        website,
        tone: 'published',
        readOnly: false,
        status: <PublishedStatus />,
      })),
      ...drafts.map((draft): FeedPendingItem => ({
        website: draftToWebsite(draft),
        tone: draft.status === 'rejected' ? 'rejected' : 'draft',
        readOnly: true,
        status: (
          <DraftStatus
            draft={draft}
            onDismiss={() => removeDrafts([draft.id])}
          />
        ),
      })),
    ],
    [published, drafts, removeDrafts]
  )
}

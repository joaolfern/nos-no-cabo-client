import { useSyncExternalStore } from 'react'
import type { IWebsite } from '@/interfaces/IWebsite'
import {
  getVotesSnapshot,
  subscribeToVotes,
  withPendingVote,
} from '@/pages/Website/utils/voterStorage'

// Net likes as the visitor sees them on the website page, pending vote included.
export function useShownLikes() {
  const votes = useSyncExternalStore(subscribeToVotes, getVotesSnapshot)

  return (website: Pick<IWebsite, 'id' | 'likes'>) =>
    withPendingVote(votes, website.id, website.likes ?? 0)
}

import { useSyncExternalStore } from 'react'
import type { IWebsite } from '@/interfaces/IWebsite'
import {
  getVotesVersion,
  subscribeToVotes,
  withPendingVote,
} from '@/pages/Website/utils/voterStorage'

// Net likes as the visitor sees them on the website page, pending vote included.
export function useShownLikes() {
  useSyncExternalStore(subscribeToVotes, getVotesVersion)

  return (website: Pick<IWebsite, 'id' | 'likes'>) =>
    withPendingVote(website.id, website.likes ?? 0)
}

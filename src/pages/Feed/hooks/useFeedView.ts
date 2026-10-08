import { useLocalStorageState } from '@/hooks/useLocalStorageState'
import { isFeedView } from '@/interfaces/IFeedView'

export function useFeedView() {
  return useLocalStorageState('feed-view', 'grid', isFeedView)
}

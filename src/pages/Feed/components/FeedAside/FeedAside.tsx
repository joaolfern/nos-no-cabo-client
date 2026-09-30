import { useIsMobile } from '@/hooks/useIsMobile'
import { FeedFilters } from '@/pages/Feed/components/FeedFilters/FeedFilters'

export function FeedAside() {
  const isMobile = useIsMobile()

  if (isMobile) {
    return null
  }

  return <FeedFilters.Panel />
}

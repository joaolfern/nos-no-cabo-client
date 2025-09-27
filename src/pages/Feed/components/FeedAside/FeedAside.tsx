import { Typography } from '@/components/Typography/Typography'
import { useIsMobile } from '@/hooks/useIsMobile'
import { FeedFilters } from '@/pages/Feed/components/FeedFilters/FeedFilters'
import { useFilters } from '@/pages/Feed/hooks/useFilters'
import { useWebsites } from '@/pages/Feed/hooks/useWebsites'

export function FeedAside() {
  const isMobile = useIsMobile()
  const { updateWebsites, websitesRaw } = useWebsites()
  const { filterByKeyword, selectedKeywords } = useFilters()

  function handleFilter() {
    if (websitesRaw) {
      updateWebsites(filterByKeyword(websitesRaw, selectedKeywords))
    }
  }

  if (isMobile) {
    return null
  }

  return (
    <aside>
      <Typography variant='h1' asVariant={true}>
        Sites
      </Typography>
      <FeedFilters.Panel onChange={handleFilter} />
    </aside>
  )
}

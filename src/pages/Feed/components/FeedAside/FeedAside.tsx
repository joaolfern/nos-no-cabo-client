import { Typography } from '@/components/Typography/Typography'
import { useIsMobile } from '@/hooks/useIsMobile'
import type { IFilterEvent } from '@/interfaces/IFilters'
import { FeedFilters } from '@/pages/Feed/components/FeedFilters/FeedFilters'
import { useFilters } from '@/pages/Feed/hooks/useFilters'
import { useWebsites } from '@/pages/Feed/hooks/useWebsites'

export function FeedAside() {
  const isMobile = useIsMobile()
  const { updateWebsites, websitesRaw } = useWebsites()
  const { filterByKeyword, selectedKeywords } = useFilters()

  function handleFilter(props?: IFilterEvent) {
    if (websitesRaw) {
      const { updatedKeywords } = props || {}
      const keywords = updatedKeywords ?? selectedKeywords

      updateWebsites(filterByKeyword(websitesRaw, keywords))
    }
  }

  if (isMobile) {
    return null
  }

  return (
    <aside>
      <Typography variant='h1' asVariant={true}>
        Nós no cabo
      </Typography>
      <FeedFilters.Panel onChange={handleFilter} />
    </aside>
  )
}

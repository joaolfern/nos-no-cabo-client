import { useIsMobile } from '@/hooks/useIsMobile'
import { FeedFilters } from '@/pages/Feed/components/FeedFilters/FeedFilters'
import { FeedSort } from '@/pages/Feed/components/FeedSort/FeedSort'
import styles from './FeedTopbar.module.scss'
import { useWebsites } from '@/pages/Feed/hooks/useWebsites'
import { useFilters } from '@/pages/Feed/hooks/useFilters'
import type { IFilterEvent } from '@/interfaces/IFilters'

export function FeedTopbar() {
  const isMobile = useIsMobile()

  const { updateWebsites, websitesRaw } = useWebsites()
  const { filterByAuthor, filterByKeyword, selectedAuthors, selectedKeywords } =
    useFilters()

  function handleFilter(props?: IFilterEvent) {
    if (websitesRaw) {
      const { updatedKeywords, updatedAuthors } = props || {}
      const keywords = updatedKeywords ?? selectedKeywords
      const authors = updatedAuthors ?? selectedAuthors

      updateWebsites(
        filterByAuthor(filterByKeyword(websitesRaw, keywords), authors)
      )
    }
  }

  return (
    <div data-testid='feed-top-bar' className={styles.feedTopbar}>
      {isMobile && <FeedFilters.Inline onChange={handleFilter} />}
      <FeedSort />
    </div>
  )
}

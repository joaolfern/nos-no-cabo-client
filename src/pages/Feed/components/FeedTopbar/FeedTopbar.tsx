import { useIsMobile } from '@/hooks/useIsMobile'
import { FeedFilters } from '@/pages/Feed/components/FeedFilters/FeedFilters'
import { FeedSort } from '@/pages/Feed/components/FeedSort/FeedSort'
import { ViewToggle } from '@/pages/Feed/components/ViewToggle/ViewToggle'
import styles from './FeedTopbar.module.scss'
import { useWebsites } from '@/pages/Feed/hooks/useWebsites'
import { useFilters } from '@/pages/Feed/hooks/useFilters'
import type { IFilterEvent } from '@/interfaces/IFilters'
import type { FeedView } from '@/interfaces/IFeedView'
import {
  ALL_CATEGORIES,
  getCategoryMeta,
} from '@/pages/Feed/constants/categories'

type FeedTopbarProps = {
  // Number of projects after filtering. Falls back to the unfiltered total.
  total?: number
  view?: FeedView
  onViewChange?: (view: FeedView) => void
}

export function FeedTopbar({
  total,
  view = 'grid',
  onViewChange,
}: FeedTopbarProps) {
  const isMobile = useIsMobile()

  const { updateWebsites, websitesRaw } = useWebsites()
  const { filterByKeyword, selectedKeywords, getKeywordById } = useFilters()
  const count = total ?? websitesRaw?.length
  const category = getKeywordById(selectedKeywords[0] ?? '')
  const { Icon, description } = category
    ? getCategoryMeta(category.name)
    : ALL_CATEGORIES

  function handleFilter(props?: IFilterEvent) {
    if (websitesRaw) {
      const { updatedKeywords } = props || {}
      const keywords = updatedKeywords ?? selectedKeywords

      updateWebsites(filterByKeyword(websitesRaw, keywords))
    }
  }

  return (
    <div data-testid='feed-top-bar' className={styles.feedTopbar}>
      <div className={styles.intro}>
        <span className={styles.path}>
          <Icon className={styles.pathIcon} aria-hidden={true} />
          nosnocabo/{category?.name ?? ''}
        </span>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>
            {category ? capitalize(category.name) : ALL_CATEGORIES.title}
          </h1>
          {count !== undefined && (
            <span
              className={styles.count}
              aria-label={`${count} ${count === 1 ? 'projeto' : 'projetos'}`}
            >
              {count}
            </span>
          )}
        </div>
        <p className={styles.description}>{description}</p>
      </div>
      {isMobile && <FeedFilters.Inline onChange={handleFilter} />}
      <div className={styles.controls}>
        {onViewChange && (
          <div className={styles.viewToggle}>
            <ViewToggle value={view} onChange={onViewChange} />
          </div>
        )}
        <FeedSort />
      </div>
    </div>
  )
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

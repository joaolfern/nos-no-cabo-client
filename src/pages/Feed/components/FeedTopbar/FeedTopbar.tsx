import { useIsMobile } from '@/hooks/useIsMobile'
import { FeedFilters } from '@/pages/Feed/components/FeedFilters/FeedFilters'
import { FeedSort } from '@/pages/Feed/components/FeedSort/FeedSort'
import { ViewToggle } from '@/pages/Feed/components/ViewToggle/ViewToggle'
import styles from './FeedTopbar.module.scss'
import { useFilters } from '@/pages/Feed/hooks/useFilters'
import type { FeedView } from '@/interfaces/IFeedView'
import {
  ALL_CATEGORIES,
  getCategoryMeta,
} from '@/pages/Feed/constants/categories'

type FeedTopbarProps = {
  // Number of projects matching the current filters, from the server.
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

  const { selectedKeywords, getKeywordById } = useFilters()
  const count = total
  const category = getKeywordById(selectedKeywords[0] ?? '')
  const {
    Icon,
    description,
    label: title,
  } = category
    ? getCategoryMeta(category.name)
    : { ...ALL_CATEGORIES, label: ALL_CATEGORIES.title }

  return (
    <div data-testid='feed-top-bar' className={styles.feedTopbar}>
      <div className={styles.intro}>
        <span className={styles.path}>
          <Icon className={styles.pathIcon} aria-hidden={true} />
          nosnocabo/{category?.name ?? ''}
        </span>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{title}</h1>
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
      {isMobile && <FeedFilters.Inline />}
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

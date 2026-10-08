import { LuFilter } from 'react-icons/lu'
import { useIsMobile } from '@/hooks/useIsMobile'
import { CategoryRowsSkeleton } from '@/pages/Feed/components/CategoryList/CategoryRowsSkeleton'
import { FeedCardListSkeleton } from '@/pages/Feed/components/FeedCardList/FeedCardListSkeleton'
import { FeedPromo } from '@/pages/Feed/components/FeedPromo/FeedPromo'
import { SocialLinks } from '@/pages/Feed/components/SocialLinks/SocialLinks'
import { ViewToggle } from '@/pages/Feed/components/ViewToggle/ViewToggle'
import { ALL_CATEGORIES } from '@/pages/Feed/constants/categories'
import { useFeedPageSize } from '@/pages/Feed/hooks/useFeedPageSize'
import { useFeedView } from '@/pages/Feed/hooks/useFeedView'
import feedStyles from '@/pages/Feed/Feed.module.scss'
import listStyles from '@/pages/Feed/components/CategoryList/CategoryList.module.scss'
import filterStyles from '@/pages/Feed/components/FeedFilters/FeedFilters.module.scss'
import topbarStyles from '@/pages/Feed/components/FeedTopbar/FeedTopbar.module.scss'
import styles from './FeedSkeleton.module.scss'

// The feed while its chunk loads: the same shell and loading state it shows while its data loads.
export function FeedSkeleton() {
  const isMobile = useIsMobile()
  const pageSize = useFeedPageSize()
  const [view, setView] = useFeedView()
  const { Icon, title, description } = ALL_CATEGORIES

  return (
    <div
      className={feedStyles.container}
      role='status'
      aria-label='Carregando projetos'
    >
      {!isMobile && <FiltersPanelSkeleton />}
      <div className={feedStyles.feed}>
        <div className={topbarStyles.feedTopbar}>
          <div className={topbarStyles.intro}>
            <span className={topbarStyles.path}>
              <Icon className={topbarStyles.pathIcon} aria-hidden={true} />
              nosnocabo/
            </span>
            <div className={topbarStyles.titleRow}>
              <span className={topbarStyles.title}>{title}</span>
            </div>
            <p className={topbarStyles.description}>{description}</p>
          </div>
          {isMobile && <span className={styles.inlineFilter} />}
          <div className={topbarStyles.controls}>
            <div className={topbarStyles.viewToggle}>
              <ViewToggle value={view} onChange={setView} />
            </div>
            <span className={styles.sort} />
          </div>
        </div>
        <FeedCardListSkeleton count={pageSize} view={view} variant='detailed' />
      </div>
    </div>
  )
}

function FiltersPanelSkeleton() {
  return (
    <aside className={filterStyles.panel}>
      <div className={filterStyles.sticky}>
        <div className={filterStyles.header}>
          <span className={filterStyles.heading}>
            <LuFilter aria-hidden={true} />
            Filtros
          </span>
          <span className={filterStyles.clear}>Limpar</span>
        </div>

        <div className={filterStyles.categories}>
          <div className={listStyles.list}>
            <div className={listStyles.header}>
              <span className={listStyles.title}>Categorias</span>
              <span className={styles.search} />
            </div>
            <CategoryRowsSkeleton maxRows={Infinity} />
          </div>
        </div>

        <div className={filterStyles.footer}>
          <FeedPromo />
          <SocialLinks />
        </div>
      </div>
    </aside>
  )
}

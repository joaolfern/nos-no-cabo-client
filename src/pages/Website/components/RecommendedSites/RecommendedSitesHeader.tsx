import { Typography } from '@/components/Typography/Typography'
import { Link } from '@/components/Link/Link'
import { ViewToggle } from '@/pages/Feed/components/ViewToggle/ViewToggle'
import type { FeedView } from '@/interfaces/IFeedView'
import styles from './RecommendedSites.module.scss'

interface RecommendedSitesHeaderProps {
  view: FeedView
  onViewChange: (view: FeedView) => void
}

export function RecommendedSitesHeader({
  view,
  onViewChange,
}: RecommendedSitesHeaderProps) {
  return (
    <div className={styles.header}>
      <Typography as='h2' variant='titleSm' className={styles.sectionTitle}>
        Sites recomendados
      </Typography>
      <div className={styles.headerActions}>
        <Link className={styles.seeAll} to='/websites'>
          Ver todos
        </Link>
        <ViewToggle value={view} onChange={onViewChange} />
      </div>
    </div>
  )
}

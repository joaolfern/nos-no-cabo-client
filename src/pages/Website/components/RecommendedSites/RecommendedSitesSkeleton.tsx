import { FeedCardListSkeleton } from '@/pages/Feed/components/FeedCardList/FeedCardListSkeleton'
import { RecommendedSitesHeader } from './RecommendedSitesHeader'
import { RECOMMENDED_SITES_LIMIT } from './recommendedSites'
import styles from './RecommendedSites.module.scss'

const ignoreViewChange = () => {}

export function RecommendedSitesSkeleton() {
  return (
    <section className={styles.container}>
      <RecommendedSitesHeader view='grid' onViewChange={ignoreViewChange} />
      <FeedCardListSkeleton
        count={RECOMMENDED_SITES_LIMIT}
        view='grid'
        variant='compact'
      />
    </section>
  )
}

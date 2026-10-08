import { useMemo, useState } from 'react'
import { useTopWebsitesData } from '@/hooks/useDataHooks'
import { FeedCardList } from '@/pages/Feed/components/FeedCardList/FeedCardList'
import type { FeedView } from '@/interfaces/IFeedView'
import { RecommendedSitesHeader } from './RecommendedSitesHeader'
import {
  RECOMMENDED_SITES_LIMIT,
  getRecommendedWebsites,
} from './recommendedSites'
import styles from './RecommendedSites.module.scss'

interface RecommendedSitesProps {
  websiteId: string
}

export function RecommendedSites({ websiteId }: RecommendedSitesProps) {
  // One extra, in case the current site is among the best.
  const { data: top = [], isLoading } = useTopWebsitesData(
    RECOMMENDED_SITES_LIMIT + 1
  )
  const [view, setView] = useState<FeedView>('grid')
  const websites = useMemo(
    () => getRecommendedWebsites(top, websiteId),
    [top, websiteId]
  )

  return (
    <section className={styles.container}>
      <RecommendedSitesHeader view={view} onViewChange={setView} />
      <FeedCardList
        data={websites}
        isLoading={isLoading}
        skeletonCount={RECOMMENDED_SITES_LIMIT}
        view={view}
        variant='compact'
      />
    </section>
  )
}

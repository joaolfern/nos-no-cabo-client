import { useMemo, useState } from 'react'
import { Typography } from '@/components/Typography/Typography'
import { Link } from '@/components/Link/Link'
import { ViewToggle } from '@/pages/Feed/components/ViewToggle/ViewToggle'
import { useWebsites } from '@/pages/Feed/hooks/useWebsites'
import { FeedCardList } from '@/pages/Feed/components/FeedCardList/FeedCardList'
import type { IWebsite } from '@/interfaces/IWebsite'
import type { FeedView } from '@/interfaces/IFeedView'
import styles from './RecommendedSites.module.scss'

const RECOMMENDED_SITES_LIMIT = 6

interface RecommendedSitesProps {
  websiteId: string
}

export function RecommendedSites({ websiteId }: RecommendedSitesProps) {
  const { websites: websitesRaw, isLoading } = useWebsites()
  const [view, setView] = useState<FeedView>('grid')
  const websites = useMemo(
    () => getRecommendedWebsites(websitesRaw, websiteId),
    [websitesRaw, websiteId]
  )

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <Typography as='h2' variant='titleSm' className={styles.sectionTitle}>
          Sites recomendados
        </Typography>
        <div className={styles.headerActions}>
          <Link className={styles.seeAll} to='/websites'>
            Ver todos
          </Link>
          <ViewToggle value={view} onChange={setView} />
        </div>
      </div>
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

function getRecommendedWebsites(
  websitesRaw: IWebsite[],
  currentWebsiteId: string
): IWebsite[] {
  if (!websitesRaw) return []

  const result: IWebsite[] = []
  for (const website of websitesRaw) {
    if (website.id !== currentWebsiteId) {
      result.push(website)
      if (result.length === RECOMMENDED_SITES_LIMIT) break
    }
  }
  return result
}

import { PageTrail } from '@/components/PageTrail/PageTrail'
import { useWebsiteDetails } from '@/pages/Website/hooks/useWebsiteDetails'
import { WebsiteLoader } from '@/pages/Website/components/WebsiteLoader/WebsiteLoader'
import { WebsiteInfoCard } from '@/pages/Website/components/WebsiteInfoCard/WebsiteInfoCard'
import { WebsiteMetrics } from '@/pages/Website/components/WebsiteMetrics/WebsiteMetrics'
import { RecommendedSites } from '@/pages/Website/components/RecommendedSites/RecommendedSites'
import { RecommendBooks } from '@/pages/Website/components/RecommendBooks/RecommendBooks'
import styles from './WebsiteContent.module.scss'

export function WebsiteContent() {
  const { website, isLoading } = useWebsiteDetails()

  if (isLoading) return <WebsiteLoader />

  if (!website) throw new Error('Not found')

  return (
    <section className={styles.container}>
      <PageTrail
        backTo='/websites'
        crumbs={[
          { label: 'Projetos', to: '/websites' },
          { label: website.name },
        ]}
      />

      <div className={styles.layout}>
        <div className={styles.infoColumn}>
          <WebsiteInfoCard website={website} />
        </div>

        <div className={styles.primaryColumn}>
          <WebsiteMetrics website={website} />
          <RecommendedSites websiteId={website.id} />
        </div>

        <div className={styles.readsColumn}>
          <RecommendBooks keywords={website.keywords} />
        </div>
      </div>
    </section>
  )
}

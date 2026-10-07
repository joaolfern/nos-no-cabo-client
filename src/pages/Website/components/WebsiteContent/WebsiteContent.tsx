import { isNotFoundError } from '@/api/toApiError'
import { PageTrail } from '@/components/PageTrail/PageTrail'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useParams } from 'react-router'
import { useWebsiteDetails } from '@/pages/Website/hooks/useWebsiteDetails'
import { WebsiteLoader } from '@/pages/Website/components/WebsiteLoader/WebsiteLoader'
import { WebsiteInfoCard } from '@/pages/Website/components/WebsiteInfoCard/WebsiteInfoCard'
import { WebsiteMetrics } from '@/pages/Website/components/WebsiteMetrics/WebsiteMetrics'
import { RecommendedSites } from '@/pages/Website/components/RecommendedSites/RecommendedSites'
import { WebsiteNotFound } from '@/pages/Website/components/WebsiteNotFound/WebsiteNotFound'
import { WebsiteSidebar } from '@/pages/Website/components/WebsiteSidebar/WebsiteSidebar'
import styles from './WebsiteContent.module.scss'

export function WebsiteContent() {
  const { website, isLoading, error } = useWebsiteDetails()
  const { id = '' } = useParams<{ id: string }>()
  const isNotFound = !isLoading && !website && isNotFoundError(error)
  usePageMeta({
    title: isNotFound ? 'Site não encontrado' : website?.name,
    description: website?.description,
    path: `/website/${id}`,
    noIndex: isNotFound,
  })

  if (isLoading) return <WebsiteLoader />

  if (isNotFound) return <WebsiteNotFound />

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

        <div className={styles.sideColumn}>
          <WebsiteSidebar website={website} />
        </div>
      </div>
    </section>
  )
}

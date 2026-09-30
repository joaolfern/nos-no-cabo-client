import { LuArrowLeft } from 'react-icons/lu'
import { Typography } from '@/components/Typography/Typography'
import { Button } from '@/components/Button/Button'
import { Link } from '@/components/Link/Link'
import { useWebsiteDetails } from '@/pages/Website/hooks/useWebsiteDetails'
import { WebsiteLoader } from '@/pages/Website/components/WebsiteLoader/WebsiteLoader'
import { WebsiteInfoCard } from '@/pages/Website/components/WebsiteInfoCard/WebsiteInfoCard'
import { WebsiteMetrics } from '@/pages/Website/components/WebsiteMetrics/WebsiteMetrics'
import { RecommendedSites } from '@/pages/Website/components/RecommendedSites/RecommendedSites'
import { RecommendBooks } from '@/pages/Website/components/RecommendBooks/RecommendBooks'
import styles from './WebsiteContent.module.scss'

export function WebsiteContent() {
  const { website, isLoading } = useWebsiteDetails()

  if (isLoading) {
    return
  }

  if (!website) throw new Error('Not found')

  return (
    <WebsiteLoader isLoading={isLoading}>
      <section className={styles.container}>
        <div className={styles.topRow}>
          <Button
            asChild={true}
            variant='outline'
            small={true}
            className={styles.back}
          >
            <Link to='/websites'>
              <LuArrowLeft size='1rem' />
              Voltar
            </Link>
          </Button>
          <Typography
            as='nav'
            variant='bodySm'
            color='muted'
            className={styles.breadcrumb}
          >
            <Link to='/websites'>Projetos</Link>
            <span>/</span>
            <span className={styles.current}>{website.name}</span>
          </Typography>
        </div>

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
    </WebsiteLoader>
  )
}

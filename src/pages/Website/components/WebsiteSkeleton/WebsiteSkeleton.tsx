import clsx from 'clsx'
import { Button } from '@/components/Button/Button'
import { PageTrail } from '@/components/PageTrail/PageTrail'
import { Tag } from '@/components/Tag/Tag'
import { WebsiteMetricsView } from '@/pages/Website/components/WebsiteMetrics/WebsiteMetrics'
import { RecommendedSitesSkeleton } from '@/pages/Website/components/RecommendedSites/RecommendedSitesSkeleton'
import contentStyles from '@/pages/Website/components/WebsiteContent/WebsiteContent.module.scss'
import infoStyles from '@/pages/Website/components/WebsiteInfoCard/WebsiteInfoCard.module.scss'
import sidebarStyles from '@/pages/Website/components/WebsiteSidebar/WebsiteSidebar.module.scss'
import { VERIFY_PANEL_INTRO } from '@/pages/WidgetEditor/components/VerifyPanel/verifyMessages'
import verifyStyles from '@/pages/WidgetEditor/components/VerifyPanel/VerifyPanel.module.scss'
import styles from './WebsiteSkeleton.module.scss'

// The page while its chunk or its data loads: the real layout and labels, with bones for the site's data.
export function WebsiteSkeleton() {
  return (
    <section
      className={contentStyles.container}
      role='status'
      aria-label='Carregando site'
    >
      <PageTrail
        backTo='/websites'
        crumbs={[
          { label: 'Projetos', to: '/websites' },
          { label: <span className={styles.text}>Nome do site</span> },
        ]}
      />

      <div className={contentStyles.layout} aria-hidden={true}>
        <div className={contentStyles.infoColumn}>
          <InfoCardSkeleton />
        </div>

        <div className={contentStyles.primaryColumn}>
          <WebsiteMetricsView
            stats={undefined}
            previous={null}
            next={null}
            random={null}
            isLoadingNeighbours={true}
          />
          <RecommendedSitesSkeleton />
        </div>

        <div className={contentStyles.sideColumn}>
          <SidebarSkeleton />
        </div>
      </div>
    </section>
  )
}

function InfoCardSkeleton() {
  return (
    <div className={infoStyles.container}>
      <div className={infoStyles.hero}>
        <span className={styles.logo} />
      </div>
      <div className={infoStyles.body}>
        <span className={clsx(styles.text, styles.title)}>Nome do site</span>
        <span className={clsx(styles.text, styles.description)}>
          &nbsp;
          <br />
          &nbsp;
          <br />
          &nbsp;
        </span>
        <div className={infoStyles.tags}>
          <Tag className={clsx(infoStyles.tag, styles.tag)}>Categoria</Tag>
        </div>
        <div className={infoStyles.actions}>
          <span className={styles.visit} />
          <span className={styles.votes} />
        </div>
      </div>
    </div>
  )
}

function SidebarSkeleton() {
  return (
    <div className={sidebarStyles.sidebar}>
      <div className={sidebarStyles.card}>
        <h2 className={sidebarStyles.title}>Selo da aliança</h2>
        <div className={verifyStyles.panel}>
          <p className={verifyStyles.text}>{VERIFY_PANEL_INTRO}</p>
          <div className={verifyStyles.actions}>
            <Button
              variant='outline'
              small={true}
              tabIndex={-1}
              className={styles.button}
            >
              Adicionar o selo
            </Button>
            <Button
              variant='secondary'
              small={true}
              tabIndex={-1}
              className={styles.button}
            >
              Verificar
            </Button>
          </div>
        </div>
      </div>

      <div className={sidebarStyles.card}>
        <h2 className={sidebarStyles.title}>Compartilhar</h2>
        <span className={styles.share} />
      </div>
    </div>
  )
}

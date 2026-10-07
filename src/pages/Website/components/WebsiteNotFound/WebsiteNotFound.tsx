import { LuArrowRight, LuSearchX } from 'react-icons/lu'
import { Button } from '@/components/Button/Button'
import { Link } from '@/components/Link/Link'
import { PageTrail } from '@/components/PageTrail/PageTrail'
import { Typography } from '@/components/Typography/Typography'
import { RecommendedSites } from '@/pages/Website/components/RecommendedSites/RecommendedSites'
import styles from './WebsiteNotFound.module.scss'

export function WebsiteNotFound() {
  return (
    <section className={styles.container}>
      <PageTrail
        backTo='/websites'
        crumbs={[
          { label: 'Projetos', to: '/websites' },
          { label: 'Site não encontrado' },
        ]}
      />

      <div className={styles.notice}>
        <LuSearchX className={styles.icon} aria-hidden={true} />
        <Typography as='h1' variant='titleMd' className={styles.title}>
          Site não encontrado
        </Typography>
        <Typography as='p' variant='bodyMd' className={styles.text}>
          Ele pode ter saído da aliança, ou o link está errado.
        </Typography>
        <Button asChild={true} variant='tertiary' className={styles.action}>
          <Link to='/websites'>
            Ver todos os projetos
            <LuArrowRight size='1rem' aria-hidden={true} />
          </Link>
        </Button>
      </div>

      <RecommendedSites websiteId='' />
    </section>
  )
}

import { PageTrail } from '@/components/PageTrail/PageTrail'
import { usePageMeta } from '@/hooks/usePageMeta'
import { Typography } from '@/components/Typography/Typography'
import { TermsContent } from '@/pages/Terms/components/TermsContent/TermsContent'
import { TERMS_VERSION_LABEL } from '@/pages/Terms/utils/terms'
import styles from './Terms.module.scss'

export function Terms() {
  usePageMeta({ title: 'Termos de uso', path: '/termos' })
  return (
    <div className={styles.page}>
      <PageTrail
        backTo='/websites'
        crumbs={[
          { label: 'Projetos', to: '/websites' },
          { label: 'Termos de uso' },
        ]}
      />
      <article className={styles.article}>
        <header className={styles.header}>
          <Typography as='h1' variant='titleSm'>
            Termos de uso
          </Typography>
          <Typography as='p' variant='bodySm' color='muted'>
            Versão de {TERMS_VERSION_LABEL}
          </Typography>
        </header>
        <TermsContent />
      </article>
    </div>
  )
}

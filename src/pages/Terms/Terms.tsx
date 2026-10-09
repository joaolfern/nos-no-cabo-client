import { usePageMeta } from '@/hooks/usePageMeta'
import { TermsContent } from '@/pages/Terms/components/TermsContent/TermsContent'
import { TermsHeader } from '@/pages/Terms/components/TermsHeader/TermsHeader'
import { TermsTrail } from '@/pages/Terms/components/TermsTrail/TermsTrail'
import styles from './Terms.module.scss'

export function Terms() {
  usePageMeta({ title: 'Termos de uso', path: '/termos' })
  return (
    <div className={styles.page}>
      <TermsTrail />
      <article className={styles.article}>
        <TermsHeader />
        <TermsContent />
      </article>
    </div>
  )
}

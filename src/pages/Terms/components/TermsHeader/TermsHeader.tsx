import { Typography } from '@/components/Typography/Typography'
import { TERMS_VERSION_LABEL } from '@/pages/Terms/utils/terms'
import styles from '@/pages/Terms/Terms.module.scss'

export function TermsHeader() {
  return (
    <header className={styles.header}>
      <Typography as='h1' variant='titleSm'>
        Termos de uso
      </Typography>
      <Typography as='p' variant='bodySm' color='muted'>
        Versão de {TERMS_VERSION_LABEL}
      </Typography>
    </header>
  )
}

import { Typography } from '@/components/Typography/Typography'
import styles from './SubmitForm.module.scss'

export function SubmitFormHeader() {
  return (
    <header className={styles.header}>
      <Typography as='h1' variant='titleSm'>
        Adicionar um site
      </Typography>
      <Typography as='p' variant='bodyMd' color='muted'>
        Mais um nó na rede. Adicione um projeto brasileiro de tecnologia e ajude
        mais gente a chegar até ele.
      </Typography>
    </header>
  )
}

import { Typography } from '@/components/Typography/Typography'
import styles from '@/pages/WidgetEditor/WidgetEditor.module.scss'

export function WidgetEditorHeader({ siteName }: { siteName: string }) {
  return (
    <header className={styles.header}>
      <Typography as='h1' variant='titleSm'>
        Adicione o selo ao seu site
      </Typography>
      <Typography
        as='p'
        variant='bodyMd'
        color='muted'
        className={styles.headerText}
      >
        Com o selo no site, {siteName} ganha o ícone de verificado e aparece
        primeiro nas listas.
      </Typography>
    </header>
  )
}

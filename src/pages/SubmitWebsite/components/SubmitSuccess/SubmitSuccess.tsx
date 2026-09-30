import { LuHourglass } from 'react-icons/lu'
import { Button } from '@/components/Button/Button'
import { Link } from '@/components/Link/Link'
import { Typography } from '@/components/Typography/Typography'
import type { ISubmittedWebsite } from '@/interfaces/IWebsite'
import styles from './SubmitSuccess.module.scss'

type SubmitSuccessProps = {
  website: ISubmittedWebsite
  onSubmitAnother: () => void
}

export function SubmitSuccess({
  website,
  onSubmitAnother,
}: SubmitSuccessProps) {
  return (
    <section className={styles.success} aria-live='polite'>
      <LuHourglass className={styles.icon} aria-hidden={true} />
      <Typography as='h1' variant='titleMd'>
        Recebemos {website.name}!
      </Typography>
      <Typography as='p' variant='bodyMd' color='muted'>
        Estamos verificando o conteúdo do site. Isso costuma levar poucos
        minutos, e depois ele aparece no feed para todo mundo.
      </Typography>
      <div className={styles.actions}>
        <Button asChild>
          <Link to='/websites'>Ver no feed</Link>
        </Button>
        <Button variant='secondary' onClick={onSubmitAnother}>
          Enviar outro site
        </Button>
      </div>
    </section>
  )
}

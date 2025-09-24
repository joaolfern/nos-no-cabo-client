import { Image } from '@/components/Image/Image'
import { Typography } from '@/components/Typography/Typography'
import styles from './Logo.module.scss'

export function Logo() {
  return (
    <div className={styles.container}>
      <Image className={styles.image} src='/logos/logo.svg' alt='Nós no cabo' />
      <span>
        <Typography className={styles.subtitle} variant='body'>
          Nós no cabo
        </Typography>
      </span>
    </div>
  )
}

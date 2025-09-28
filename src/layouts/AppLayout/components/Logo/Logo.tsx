import { Image } from '@/components/Image/Image'
import { Typography } from '@/components/Typography/Typography'
import styles from './Logo.module.scss'
import { isAdminMode } from '@/config/env'

export function Logo() {
  return (
    <div className={styles.container}>
      <Image className={styles.image} src='/logos/logo.svg' alt='Nós no cabo' />
      <span>
        <Typography className={styles.subtitle} variant='body'>
          {isAdminMode ? 'Sysadmin.' : 'Nós no cabo'}
        </Typography>
      </span>
    </div>
  )
}

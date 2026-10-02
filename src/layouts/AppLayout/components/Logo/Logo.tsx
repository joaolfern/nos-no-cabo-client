import { Image } from '@/components/Image/Image'
import { Typography } from '@/components/Typography/Typography'
import styles from './Logo.module.scss'
import { Link } from '@/components/Link/Link'

export function Logo() {
  return (
    <Link to='/'>
      <div className={styles.container}>
        <Image
          className={styles.image}
          src='/logos/logo.png'
          alt='Nós no cabo'
        />
        <span>
          <Typography className={styles.subtitle} variant='titleSm'>
            Nós no cabo
          </Typography>
        </span>
      </div>
    </Link>
  )
}

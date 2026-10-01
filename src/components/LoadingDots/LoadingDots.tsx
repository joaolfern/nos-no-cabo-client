import clsx from 'clsx'
import styles from './LoadingDots.module.scss'

type LoadingDotsProps = {
  className?: string
}

export function LoadingDots({ className }: LoadingDotsProps) {
  return (
    <span className={clsx(styles.dots, className)} aria-hidden={true}>
      <span className={styles.dot} />
      <span className={styles.dot} />
      <span className={styles.dot} />
    </span>
  )
}

import { clsx } from 'clsx'
import styles from './BackgroundEffect.module.scss'

const VARIANTS = ['secondary', 'tertiary', 'primary'] as const
const CIRCLES_COUNT = 20
const circlesArray = Array.from({ length: CIRCLES_COUNT })

export function BackgroundEffect() {
  return (
    <div className={styles.container}>
      {circlesArray.map((_, index) => (
        <Circle key={index} variant={VARIANTS[index % VARIANTS.length]} />
      ))}
    </div>
  )
}

type CircleProps = {
  variant: 'primary' | 'secondary' | 'tertiary'
}

function Circle({ variant }: CircleProps) {
  return <span className={clsx(styles.circle, styles[variant])} />
}

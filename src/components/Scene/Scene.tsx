import clsx from 'clsx'
import { memo } from 'react'
import { Typography } from '@/components/Typography/Typography'
import styles from './Scene.module.scss'

type SceneProps = {
  fallbackBackground: string
  fallbackAccent: string
  fallbackText?: string
  className?: string
  width?: string
  height?: string
}

export const Scene = memo(function Scene({
  fallbackBackground,
  fallbackAccent,
  fallbackText,
  className,
  width,
  height,
}: SceneProps) {
  return (
    <div>
      <div
        className={clsx(styles.fallbackContainer, className)}
        style={{ backgroundColor: fallbackBackground, width, height }}
      >
        {fallbackText && (
          <Typography className={styles.fallbackText} variant='bodyLg'>
            {fallbackText}
          </Typography>
        )}
      </div>
      <div
        className={styles.fallbackAccent}
        style={{ backgroundColor: fallbackAccent }}
      />
    </div>
  )
})

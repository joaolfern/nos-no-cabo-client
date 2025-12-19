import { useTheme } from '@/hooks/useTheme'
import UnicornScene, { type UnicornSceneProps } from 'unicornstudio-react'
import styles from './Scene.module.scss'
import { memo } from 'react'
import { Typography } from '@/components/Typography/Typography'
import clsx from 'clsx'

type SceneProps = UnicornSceneProps & {
  fallbackBackground: string
  fallbackAccent: string
  fallbackText?: string
}

export const Scene = memo(function Scene({
  fallbackBackground,
  className,
  width,
  height,
  fallbackAccent,
  ...props
}: SceneProps) {
  const { animationsEnabled } = useTheme()
  if (!animationsEnabled) {
    return (
      <div>
        <div
          className={clsx(styles.fallbackContainer, className)}
          style={{ backgroundColor: fallbackBackground, width, height }}
        >
          {props.fallbackText && (
            <Typography className={styles.fallbackText} variant='bodyLarge'>
              {props.fallbackText}
            </Typography>
          )}
        </div>
        <div
          className={styles.fallbackAccent}
          style={{ backgroundColor: fallbackAccent }}
        />
      </div>
    )
  }

  return (
    <UnicornScene
      className={className}
      width={width}
      height={height}
      {...props}
    />
  )
})

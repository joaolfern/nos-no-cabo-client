import styles from './BackgroundEffect.module.scss'
import { useTheme } from '@/hooks/useTheme'
import { memo } from 'react'
import { Scene } from '@/components/Scene/Scene'

export const BackgroundEffect = memo(function BackgroundEffect() {
  const { mode } = useTheme()
  const filename = `${mode}/waves.json`

  return (
    <div className={`${styles.container} `}>
      <Scene
        fallbackBackground='var(--color-background-400)'
        fallbackAccent='var(--color-secondary-400)'
        jsonFilePath={`/unicornStudio/${filename}`}
      />
    </div>
  )
})

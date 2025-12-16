import styles from './BackgroundEffect.module.scss'
import UnicornScene from 'unicornstudio-react'
import { useTheme } from '@/hooks/useTheme'
import { isLocal } from '@/config/env'
import { memo } from 'react'

export const BackgroundEffect = memo(function BackgroundEffect() {
  const { mode } = useTheme()
  const filename = `${mode}Waves.json`

  return (
    <div className={`${styles.container} `}>
      {isLocal ? null : (
        <UnicornScene jsonFilePath={`/unicornStudio/${filename}`} />
      )}
    </div>
  )
})

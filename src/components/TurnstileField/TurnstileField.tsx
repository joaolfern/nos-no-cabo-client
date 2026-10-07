import { useEffect, useRef } from 'react'
import clsx from 'clsx'
import { loadTurnstile, type TurnstileAppearance } from './loadTurnstile'
import styles from './TurnstileField.module.scss'

type TurnstileFieldProps = {
  siteKey: string
  onTokenChange: (token: string | null) => void
  appearance?: TurnstileAppearance
}

export function TurnstileField({
  siteKey,
  onTokenChange,
  appearance = 'always',
}: TurnstileFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let widgetId: string | undefined
    let isMounted = true

    loadTurnstile()
      .then((turnstile) => {
        if (!isMounted || !containerRef.current) return

        widgetId = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          language: 'pt-br',
          appearance,
          callback: onTokenChange,
          'expired-callback': () => onTokenChange(null),
          'error-callback': () => onTokenChange(null),
        })
      })
      .catch(() => onTokenChange(null))

    return () => {
      isMounted = false
      if (widgetId) window.turnstile?.remove(widgetId)
    }
  }, [siteKey, onTokenChange, appearance])

  return (
    <div
      ref={containerRef}
      className={clsx({ [styles.widget]: appearance === 'always' })}
    />
  )
}

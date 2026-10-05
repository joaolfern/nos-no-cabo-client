import { useEffect, useRef } from 'react'
import clsx from 'clsx'
import styles from './TurnstileField.module.scss'

const TURNSTILE_SCRIPT_URL =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

type TurnstileApi = {
  render: (
    element: HTMLElement,
    options: {
      sitekey: string
      language: string
      appearance: TurnstileAppearance
      callback: (token: string) => void
      'expired-callback': () => void
      'error-callback': () => void
    }
  ) => string
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

type TurnstileAppearance = 'always' | 'interaction-only'

let turnstileScript: Promise<TurnstileApi> | null = null

function loadTurnstile(): Promise<TurnstileApi> {
  turnstileScript ??= new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = TURNSTILE_SCRIPT_URL
    script.async = true
    script.onload = () =>
      window.turnstile ? resolve(window.turnstile) : reject()
    script.onerror = () => {
      turnstileScript = null
      reject()
    }
    document.head.appendChild(script)
  })

  return turnstileScript
}

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

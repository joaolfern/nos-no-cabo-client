import { useEffect, useRef } from 'react'
import styles from './TurnstileField.module.scss'

const TURNSTILE_SCRIPT_URL =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

type TurnstileApi = {
  render: (
    element: HTMLElement,
    options: {
      sitekey: string
      language: string
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
}

export function TurnstileField({
  siteKey,
  onTokenChange,
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
  }, [siteKey, onTokenChange])

  return <div ref={containerRef} className={styles.widget} />
}

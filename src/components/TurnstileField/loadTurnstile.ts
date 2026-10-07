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

export type TurnstileAppearance = 'always' | 'interaction-only'

let turnstileScript: Promise<TurnstileApi> | null = null

export function loadTurnstile(): Promise<TurnstileApi> {
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

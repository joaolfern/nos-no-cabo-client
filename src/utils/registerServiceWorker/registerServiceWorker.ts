import { registerSW } from 'virtual:pwa-register'
import { ENABLE_MOCKS } from '@/config/env'

type OnUpdateReady = (applyUpdate: () => void) => void

let isRegistered = false

// MSW's worker owns the root scope while mocks are on.
export function registerServiceWorker(onUpdateReady: OnUpdateReady) {
  if (isRegistered || ENABLE_MOCKS || !('serviceWorker' in navigator)) return
  isRegistered = true

  const updateServiceWorker = registerSW({
    onNeedRefresh: () => onUpdateReady(() => updateServiceWorker(true)),
  })
}

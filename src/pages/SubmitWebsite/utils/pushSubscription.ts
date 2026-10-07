import { ENABLE_MOCKS, VAPID_PUBLIC_KEY } from '@/config/env'

// MSW's dev worker owns the root scope, so push only runs against the real API.
export function pushPublicKey() {
  const isSupported = 'serviceWorker' in navigator && 'PushManager' in window
  return !ENABLE_MOCKS && isSupported && VAPID_PUBLIC_KEY
    ? VAPID_PUBLIC_KEY
    : null
}

function fromBase64Url(text: string) {
  const base64 = text.replace(/-/g, '+').replace(/_/g, '/')
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0))
}

export async function getPushSubscription(publicKey: string) {
  await navigator.serviceWorker.register('/sw.js')
  const { pushManager } = await navigator.serviceWorker.ready
  const existing = await pushManager.getSubscription()
  if (existing) return existing

  return pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: fromBase64Url(publicKey),
  })
}

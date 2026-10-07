const RELOADED_AT_KEY = 'preloadErrorReloadedAt'
const RELOAD_COOLDOWN_MS = 10_000

function readReloadedAt() {
  try {
    return Number(sessionStorage.getItem(RELOADED_AT_KEY))
  } catch {
    return 0
  }
}

function writeReloadedAt(timestamp: number) {
  try {
    sessionStorage.setItem(RELOADED_AT_KEY, String(timestamp))
  } catch {
    return
  }
}

function handlePreloadError(event: Event) {
  const now = Date.now()
  const reloadedRecently = now - readReloadedAt() < RELOAD_COOLDOWN_MS
  if (reloadedRecently) {
    return
  }

  event.preventDefault()
  writeReloadedAt(now)
  window.location.reload()
}

// A deploy swaps the hashed chunks; a tab still on the old build reloads to fetch the new ones.
export function reloadOnPreloadError() {
  window.addEventListener('vite:preloadError', handlePreloadError)
  return () =>
    window.removeEventListener('vite:preloadError', handlePreloadError)
}

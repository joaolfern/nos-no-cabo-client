import { useCallback, useSyncExternalStore } from 'react'

export type NotificationPermissionState = NotificationPermission | 'unsupported'

const listeners = new Set<() => void>()

function readPermission(): NotificationPermissionState {
  return 'Notification' in window ? Notification.permission : 'unsupported'
}

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  return () => listeners.delete(onChange)
}

// Shared by every caller, so granting from one place updates them all.
export function useNotificationPermission() {
  const permission = useSyncExternalStore(subscribe, readPermission)

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return 'unsupported'

    const result = await Notification.requestPermission()
    listeners.forEach((listener) => listener())
    return result
  }, [])

  return { permission, requestPermission }
}

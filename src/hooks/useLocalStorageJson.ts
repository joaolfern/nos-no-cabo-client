import { useCallback, useMemo, useSyncExternalStore } from 'react'

type Listener = () => void

const listenersByKey = new Map<string, Set<Listener>>()
const memoryFallback = new Map<string, string>()

function readRaw(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return memoryFallback.get(key) ?? null
  }
}

function writeRaw(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Storage is unavailable, the value only lives in memory
    memoryFallback.set(key, value)
  }
  listenersByKey.get(key)?.forEach((listener) => listener())
}

function parse<T>(
  raw: string | null,
  initialValue: T,
  isValid: (value: unknown) => value is T
): T {
  if (raw === null) return initialValue

  try {
    const value: unknown = JSON.parse(raw)
    return isValid(value) ? value : initialValue
  } catch {
    return initialValue
  }
}

// JSON sibling of useLocalStorageState, shared by every hook using the same key
// in this tab and kept in sync with other tabs through the storage event.
export function useLocalStorageJson<T>(
  key: string,
  initialValue: T,
  isValid: (value: unknown) => value is T
) {
  const subscribe = useCallback(
    (onChange: Listener) => {
      const listeners = listenersByKey.get(key) ?? new Set<Listener>()
      listeners.add(onChange)
      listenersByKey.set(key, listeners)

      const onStorage = (event: StorageEvent) => {
        if (event.key === key) onChange()
      }
      window.addEventListener('storage', onStorage)

      return () => {
        listeners.delete(onChange)
        window.removeEventListener('storage', onStorage)
      }
    },
    [key]
  )

  const raw = useSyncExternalStore(subscribe, () => readRaw(key))

  const value = useMemo(
    () => parse(raw, initialValue, isValid),
    [raw, initialValue, isValid]
  )

  const update = useCallback(
    (next: T | ((current: T) => T)) => {
      const current = parse(readRaw(key), initialValue, isValid)
      const resolved =
        typeof next === 'function' ? (next as (current: T) => T)(current) : next

      writeRaw(key, JSON.stringify(resolved))
    },
    [key, initialValue, isValid]
  )

  return [value, update] as const
}

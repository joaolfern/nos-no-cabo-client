import { useCallback, useState } from 'react'

function readStored<T extends string>(
  key: string,
  initialValue: T,
  isValid: (value: string) => value is T
) {
  try {
    const stored = localStorage.getItem(key)

    if (stored !== null && isValid(stored)) return stored
  } catch {
    // Storage is unavailable, fall back to the initial value
  }

  return initialValue
}

// Keeps a string option in localStorage. Storage can be unavailable (private
// windows, blocked site data), so every access is guarded and the state keeps
// working in memory.
export function useLocalStorageState<T extends string>(
  key: string,
  initialValue: T,
  isValid: (value: string) => value is T
) {
  const [state, setState] = useState<T>(() =>
    readStored(key, initialValue, isValid)
  )

  const update = useCallback(
    (value: T) => {
      setState(value)

      try {
        localStorage.setItem(key, value)
      } catch {
        // Storage is unavailable, the value only lives in memory
      }
    },
    [key]
  )

  return [state, update] as const
}

import type { ThemeModes, ThemeVariables } from '@/interfaces/ITheme'
import { DARK_THEME_VARIABLES } from '@/themes/dark'
import { DIMMED_THEME_VARIABLES } from '@/themes/dimmed'
import { LIGHT_THEME_VARIABLES } from '@/themes/light'

export const THEME_VARIABLES: Record<
  ThemeModes,
  Record<ThemeVariables, string>
> = {
  dark: DARK_THEME_VARIABLES,
  dimmed: DIMMED_THEME_VARIABLES,
  light: LIGHT_THEME_VARIABLES,
}

// The browser/OS bar color (meta theme-color) for each mode: the app's page background.
export function themeColor(mode: ThemeModes) {
  return THEME_VARIABLES[mode]['color-background-100']
}

const DIMMED_UNLOCKED_KEY = 'dimmedThemeUnlocked'
const SEEN_MODES_KEY = 'seenThemeModes'

// Light → dark → dimmed → light; dimmed only joins once the visitor has used both dark and light.
export function nextThemeMode(mode: ThemeModes, dimmedUnlocked: boolean) {
  if (mode === 'light') return 'dark'
  if (mode === 'dark' && dimmedUnlocked) return 'dimmed'
  return 'light'
}

function readStorage(key: string) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    return
  }
}

export function isDimmedUnlocked() {
  return readStorage(DIMMED_UNLOCKED_KEY) === 'true'
}

// Returns whether dimmed is unlocked after this mode was shown.
export function recordSeenMode(mode: ThemeModes) {
  if (isDimmedUnlocked()) return true

  const seen = new Set(
    (readStorage(SEEN_MODES_KEY) ?? '').split(',').filter(Boolean)
  )
  seen.add(mode)
  writeStorage(SEEN_MODES_KEY, [...seen].join(','))

  const unlocked = seen.has('dark') && seen.has('light')
  if (unlocked) writeStorage(DIMMED_UNLOCKED_KEY, 'true')
  return unlocked
}

const THEME_MODES = Object.keys(THEME_VARIABLES)

export function isThemeMode(value: string | null): value is ThemeModes {
  return value !== null && THEME_MODES.includes(value)
}

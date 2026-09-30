import { useTheme } from '@/hooks/useTheme'
import { useThemeToggleTransition } from '@/hooks/useThemeToggleTransition'

export function useThemeSwitcher() {
  const { mode } = useTheme()
  const { toggleTheme } = useThemeToggleTransition()

  const themeIcon = ICON_BY_MODE[mode]

  return {
    handleTheme: toggleTheme,
    themeIcon,
  }
}

const ICON_BY_MODE = {
  dark: '🌙',
  light: '☀️',
}

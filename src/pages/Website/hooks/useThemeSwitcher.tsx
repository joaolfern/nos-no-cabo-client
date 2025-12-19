import { useTheme } from '@/hooks/useTheme'

export function useThemeSwitcher() {
  const { mode, updateThemeMode } = useTheme()

  const handleTheme = () => {
    updateThemeMode(mode === 'dark' ? 'light' : 'dark')
  }

  const themeIcon = ICON_BY_MODE[mode]

  return {
    handleTheme,
    themeIcon,
  }
}

const ICON_BY_MODE = {
  dark: '🌙',
  light: '☀️',
}

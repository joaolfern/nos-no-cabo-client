import { Button } from '@/components/Button/Button'
import { useTheme } from '@/hooks/useTheme'

export function ThemeSwitcher() {
  const { mode, updateThemeMode } = useTheme()

  const handleTheme = () => {
    updateThemeMode(mode === 'dark' ? 'light' : 'dark')
  }

  return <Button onClick={handleTheme}>{mode}</Button>
}

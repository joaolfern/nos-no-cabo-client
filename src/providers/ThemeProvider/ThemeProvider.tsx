import { ThemeContext } from '@/contexts/ThemeContext'
import type { IThemeContext } from '@/interfaces/ITheme'
import { DARK_THEME_VARIABLES } from '@/themes/dark'
import { LIGHT_THEME_VARIABLES } from '@/themes/light'
import { useEffect, useMemo, useState } from 'react'

interface ThemeProviderProps {
  children: React.ReactNode
}

const matchesDark = (match: boolean) => (match ? 'dark' : 'light')

const getCurrentTheme = () => {
  const storedTheme = localStorage.getItem('theme')
  if (storedTheme) {
    return storedTheme as IThemeContext['mode']
  }

  return matchesDark(window.matchMedia('(prefers-color-scheme: dark)').matches)
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setThemeMode] = useState<IThemeContext['mode']>(getCurrentTheme)

  const updateThemeMode = (newMode: IThemeContext['mode']) => {
    setThemeMode(newMode)
    localStorage.setItem('theme', newMode)
  }

  function applyThemeVariables(themeMode: IThemeContext['mode']) {
    const variables =
      themeMode === 'dark' ? DARK_THEME_VARIABLES : LIGHT_THEME_VARIABLES

    Object.entries(variables).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value)
    })
  }

  useEffect(() => {
    applyThemeVariables(mode)
  }, [mode])

  useEffect(() => {
    const darkMatchMedia = window.matchMedia('(prefers-color-scheme: dark)')

    function handleThemeChange(event: MediaQueryListEvent) {
      setThemeMode(matchesDark(event.matches))
    }

    darkMatchMedia.addEventListener('change', handleThemeChange)
    return () => darkMatchMedia.removeEventListener('change', handleThemeChange)
  }, [])

  const value: IThemeContext = useMemo(
    () => ({
      mode,
      updateThemeMode,
    }),
    [mode]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

import { ThemeContext } from '@/contexts/ThemeContext'
import type { IThemeContext } from '@/interfaces/ITheme'
import { DARK_THEME_VARIABLES } from '@/themes/dark'
import { LIGHT_THEME_VARIABLES } from '@/themes/light'
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useState,
} from 'react'

interface ThemeProviderProps {
  children: React.ReactNode
}

const matchesDark = (match: boolean) => (match ? 'dark' : 'light')

const toggleAnimationReducer = (state: boolean) => {
  const newState = !state

  localStorage.setItem('animationsEnabled', String(newState))
  return newState
}

const getCurrentTheme = () => {
  const storedTheme = localStorage.getItem('themeMode')
  if (storedTheme) {
    return storedTheme as IThemeContext['mode']
  }

  return matchesDark(window.matchMedia('(prefers-color-scheme: dark)').matches)
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setThemeMode] = useState<IThemeContext['mode']>(getCurrentTheme)
  const [animationsEnabled, toggleAnimations] = useReducer(
    toggleAnimationReducer,
    localStorage.getItem('animationsEnabled') === 'false' ? false : true
  )

  const updateThemeMode = (newMode: IThemeContext['mode']) => {
    setThemeMode(newMode)
    localStorage.setItem('themeMode', newMode)
  }

  function applyThemeVariables(themeMode: IThemeContext['mode']) {
    const variables =
      themeMode === 'dark' ? DARK_THEME_VARIABLES : LIGHT_THEME_VARIABLES

    Object.entries(variables).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value)
    })
  }

  useLayoutEffect(() => {
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
      animationsEnabled,
      toggleAnimations,
    }),
    [mode, toggleAnimations, animationsEnabled]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

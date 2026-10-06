import { ThemeContext } from '@/contexts/ThemeContext'
import type { IThemeContext } from '@/interfaces/ITheme'
import {
  THEME_VARIABLES,
  isDimmedUnlocked,
  isThemeMode,
  nextThemeMode,
  recordSeenMode,
} from '@/themes/themeModes'
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
  if (isThemeMode(storedTheme)) return storedTheme

  return matchesDark(window.matchMedia('(prefers-color-scheme: dark)').matches)
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setThemeMode] = useState<IThemeContext['mode']>(getCurrentTheme)
  const [dimmedUnlocked, setDimmedUnlocked] = useState(isDimmedUnlocked)
  const [animationsEnabled, toggleAnimations] = useReducer(
    toggleAnimationReducer,
    localStorage.getItem('animationsEnabled') === 'false' ? false : true
  )

  const updateThemeMode = (newMode: IThemeContext['mode']) => {
    setThemeMode(newMode)
    localStorage.setItem('themeMode', newMode)
  }

  function applyThemeVariables(themeMode: IThemeContext['mode']) {
    Object.entries(THEME_VARIABLES[themeMode]).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value)
    })
  }

  useLayoutEffect(() => {
    applyThemeVariables(mode)
    setDimmedUnlocked(recordSeenMode(mode))
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
      nextMode: nextThemeMode(mode, dimmedUnlocked),
      updateThemeMode,
      animationsEnabled,
      toggleAnimations,
    }),
    [mode, dimmedUnlocked, toggleAnimations, animationsEnabled]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

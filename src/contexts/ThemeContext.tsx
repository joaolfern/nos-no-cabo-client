import type { IThemeContext } from '@/interfaces/ITheme'
import { createContext } from 'react'

const modeStorage = localStorage.getItem('themeMode') as 'light' | 'dark' | null

const animationsStorage =
  localStorage.getItem('animationsEnabled') === 'false' ? false : true

const INITIAL_THEME: IThemeContext = {
  mode: modeStorage ?? 'dark',
  updateThemeMode: () => {},
  animationsEnabled: animationsStorage ?? true,
  toggleAnimations: () => {},
}

export const ThemeContext = createContext<IThemeContext>(INITIAL_THEME)

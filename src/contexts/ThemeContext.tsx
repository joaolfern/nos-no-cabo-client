import type { IThemeContext } from '@/interfaces/ITheme'
import { createContext } from 'react'
import { isThemeMode } from '@/themes/themeModes'

const modeStorage = localStorage.getItem('themeMode')

const animationsStorage =
  localStorage.getItem('animationsEnabled') === 'false' ? false : true

const INITIAL_THEME: IThemeContext = {
  mode: isThemeMode(modeStorage) ? modeStorage : 'dark',
  nextMode: 'light',
  updateThemeMode: () => {},
  animationsEnabled: animationsStorage ?? true,
  toggleAnimations: () => {},
}

export const ThemeContext = createContext<IThemeContext>(INITIAL_THEME)

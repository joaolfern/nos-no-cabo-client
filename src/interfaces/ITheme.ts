export type IThemeContext = {
  mode: ThemeModes
  updateThemeMode: (newMode: ThemeModes) => void
}

export type ThemeModes = 'light' | 'dark'

export type ThemeVariables =
  | 'color-neutral-100'
  | 'color-neutral-200'
  | 'color-neutral-300'
  | 'color-neutral-400'
  | 'color-neutral-500'
  | 'color-neutral-600'
  | 'color-neutral-700'
  | 'color-primary-100'
  | 'color-primary-300'
  | 'color-primary-400'
  | 'color-primary-500'
  | 'color-primary-foreground-400'
  | 'color-secondary-300'
  | 'color-secondary-400'
  | 'color-secondary-500'
  | 'color-secondary-foreground-400'
  | 'color-accent-300'
  | 'color-accent-400'
  | 'color-accent-500'
  | 'color-danger-100'
  | 'color-danger-700'
  | 'color-border-400'
  | 'color-background-100'
  | 'color-background-200'
  | 'color-background-300'
  | 'color-background-400'
  | 'color-background-500'
  | 'blur-background'

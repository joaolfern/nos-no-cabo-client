import type { ThemeVariables } from '@/interfaces/ITheme'
import { DARK_THEME_VARIABLES } from '@/themes/dark'

// The landing page's deep indigo background, with cards in a faint white over it
// (#ffffff12, made opaque so dropdowns and modals don't show what's behind them).
export const DIMMED_THEME_VARIABLES: Record<ThemeVariables, string> = {
  ...DARK_THEME_VARIABLES,

  'color-border-400': '#ffffff24',

  'color-background-100': '#050313',
  'color-background-200': '#ffffff1a',
  'color-background-300': '#302f3d',

  'color-surface': '#171524',
  'color-raised': '#252332',

  'color-text-base': '#f2f0f5',
  'color-text-muted': '#d4d0da',
  'color-text-subtle': '#b3afbb',
}

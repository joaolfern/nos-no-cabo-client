import type { CSSProperties } from 'react'
import type { IThemeContext } from '@/interfaces/ITheme'

// The landing page keeps the palette it had before the token rework on
// purpose. The tokens below were retuned for the other pages, so the landing
// page gets its own copy of the old values, scoped through inline custom
// properties on its root element.
export const LANDING_THEME: Record<IThemeContext['mode'], CSSProperties> = {
  dark: {
    '--color-border-400': '#ffffff45',
    '--color-background-000': '#1a1a1e38',
    '--color-background-100': '#121217',
    '--color-background-200': '#1a1a1e',
    '--color-background-300': '#2c2e31',
    '--color-background-400': '#050313',
    '--color-background-500': '#1d1f21',
  } as CSSProperties,
  dimmed: {
    '--color-border-400': '#ffffff45',
    '--color-background-400': '#050313',
  } as CSSProperties,
  // Light mode is plain: solid bubbles, no pink shadows and no glow on the lines.
  light: {
    '--bubble-background': 'var(--color-surface)',
    '--bubble-color': 'var(--color-text-base)',
    '--bubble-shadow': '0 1px 3px rgb(0 0 0 / 0.08)',
    '--landing-line-glow': 'none',
    '--color-border-400': '#e6e0e3',
    '--color-background-100': '#f2f0f2',
    '--color-background-200': '#e6e0e3',
    '--color-background-300': '#c5c0c8',
    '--color-background-400': '#FFFFFF',
    '--color-background-500': '#f2f0f2',
  } as CSSProperties,
}

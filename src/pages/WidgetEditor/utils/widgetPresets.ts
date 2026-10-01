export type WidgetPreset =
  | 'faixa'
  | 'selo'
  | 'cartao'
  | 'texto'
  | 'personalizado'
export type WidgetTheme = 'claro' | 'escuro' | 'auto'
export type WidgetAccent = 'rosa' | 'roxo' | 'azul' | 'verde' | 'laranja'
export type WidgetLogo = 'cor' | 'gradiente' | 'original'

export type WidgetOptions = {
  preset: WidgetPreset
  theme: WidgetTheme
  accent: WidgetAccent
  logo: WidgetLogo
  nav: boolean
  random: boolean
}

type PresetDefinition = {
  id: WidgetPreset
  label: string
  supportsStyle: boolean
  supportsLogo: boolean
  supportsNav: boolean
  supportsRandom: boolean
}

export const WIDGET_PRESETS: PresetDefinition[] = [
  {
    id: 'faixa',
    label: 'Faixa',
    supportsStyle: true,
    supportsLogo: true,
    supportsNav: true,
    supportsRandom: true,
  },
  {
    id: 'selo',
    label: 'Selo 88×31',
    supportsStyle: true,
    supportsLogo: true,
    supportsNav: false,
    supportsRandom: true,
  },
  {
    id: 'cartao',
    label: 'Cartão',
    supportsStyle: true,
    supportsLogo: true,
    supportsNav: true,
    supportsRandom: true,
  },
  {
    id: 'texto',
    label: 'Texto',
    supportsStyle: false,
    supportsLogo: false,
    supportsNav: true,
    supportsRandom: true,
  },
  {
    id: 'personalizado',
    label: 'Personalizado',
    supportsStyle: false,
    supportsLogo: false,
    supportsNav: false,
    supportsRandom: false,
  },
]

export const WIDGET_THEMES: { id: WidgetTheme; label: string }[] = [
  { id: 'claro', label: 'Claro' },
  { id: 'escuro', label: 'Escuro' },
  { id: 'auto', label: 'Automático' },
]

export const WIDGET_LOGOS: { id: WidgetLogo; label: string }[] = [
  { id: 'cor', label: 'Na cor escolhida' },
  { id: 'gradiente', label: 'Gradiente' },
  { id: 'original', label: 'Original' },
]

export const WIDGET_ACCENTS: Record<
  WidgetAccent,
  { label: string; claro: string; escuro: string }
> = {
  rosa: { label: 'Rosa', claro: '#d7314f', escuro: '#ef506c' },
  roxo: { label: 'Roxo', claro: '#8a3fd1', escuro: '#b46cf2' },
  azul: { label: 'Azul', claro: '#2563c9', escuro: '#5b8def' },
  verde: { label: 'Verde', claro: '#1d7f55', escuro: '#2f9e6c' },
  laranja: { label: 'Laranja', claro: '#b4560c', escuro: '#d9752a' },
}

export const DEFAULT_WIDGET_OPTIONS: WidgetOptions = {
  preset: 'faixa',
  theme: 'auto',
  accent: 'rosa',
  logo: 'cor',
  nav: true,
  random: true,
}

export function presetDefinition(preset: WidgetPreset): PresetDefinition {
  return WIDGET_PRESETS.find(({ id }) => id === preset) ?? WIDGET_PRESETS[0]
}

export type Backdrop = 'claro' | 'escuro'

export function previewTheme(theme: WidgetTheme, backdrop: Backdrop) {
  return theme === 'auto' ? backdrop : theme
}

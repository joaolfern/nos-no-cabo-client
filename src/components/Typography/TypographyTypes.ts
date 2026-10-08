import type { ElementType, HTMLAttributes } from 'react'

export interface TypographyProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'color'
> {
  as?: ElementType
  variant?: Variant
  color?: Color
  lines?: number
}

type Variant =
  'titleLg' | 'titleMd' | 'titleSm' | 'bodyLg' | 'bodyMd' | 'bodySm' | 'caption'

type Color = 'base' | 'muted' | 'subtle' | 'primary' | 'tint' | 'inherit'

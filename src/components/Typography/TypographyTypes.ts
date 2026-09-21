import type { CSSProperties, ElementType } from 'react'

export type _variant =
  | 'body'
  | 'bodySmall'
  | 'bodyLarge'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'caption'

export type TypographyElementProps =
  React.HTMLAttributes<HTMLParagraphElement> & {
    variant: _variant
    asVariant?: boolean
  }

export type TypographyElement<T extends TypographyElementProps> =
  React.ElementType<T>

export interface TypographyProps {
  as?: ElementType
  variant?: Variant
  color?: Color
  lines?: number
  className?: string
  children: React.ReactNode
  style?: CSSProperties
}

type Variant =
  | 'titleLg'
  | 'titleMd'
  | 'titleSm'
  | 'bodyLg'
  | 'bodyMd'
  | 'bodySm'
  | 'caption'

type Color = 'base' | 'muted' | 'subtle' | 'primary'

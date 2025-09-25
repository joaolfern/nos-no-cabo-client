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

export type TypographyProps = TypographyElementProps & {
  strong?: boolean
  secondary?: boolean
  numberOfLines?: number
  asVariant?: boolean
}

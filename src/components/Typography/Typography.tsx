import clsx from 'clsx'
import styles from './Typography.module.scss'
import type { CSSProperties } from 'react'
import type { TypographyProps } from './TypographyTypes'

export function Typography({
  as: Component = 'span',
  variant = 'bodyMd',
  color = 'base',
  lines,
  className,
  style,
  ...props
}: TypographyProps) {
  const styleFinal: CSSProperties = {
    ...style,
    ...(lines && {
      ['--line-clamp' as string]: lines,
    }),
  }

  return (
    <Component
      className={clsx(
        styles.root,
        styles[variant],
        styles[color],
        {
          [styles.clamp]: lines,
        },
        className
      )}
      style={styleFinal}
      {...props}
    />
  )
}

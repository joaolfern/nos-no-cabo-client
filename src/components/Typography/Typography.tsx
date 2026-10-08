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
  const styleFinal = {
    ...style,
    ...(lines && { '--line-clamp': lines }),
  } as CSSProperties

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

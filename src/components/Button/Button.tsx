import clsx from 'clsx'
import styles from './Button.module.scss'
import React from 'react'
import { AsChild } from '@/components/AsChild/AsChild'

type _variant = 'primary' | 'secondary'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: _variant
  small?: boolean
  asChild?: boolean
}

export function Button({
  variant = 'primary',
  className,
  children,
  small,
  asChild,
  ...props
}: ButtonProps) {
  const variantClass = VARIANT_CLASSES[variant]
  const classNameFinal = clsx(
    styles.button,
    variantClass,
    { [styles.small]: small },
    className
  )

  if (asChild && React.isValidElement(children)) {
    return (
      <AsChild
        props={{
          className: classNameFinal,
          ...props,
        }}
      >
        {children}
      </AsChild>
    )
  }

  return (
    <button className={classNameFinal} {...props}>
      {children}
    </button>
  )
}

const VARIANT_CLASSES: Record<_variant, string> = {
  primary: styles.primary,
  secondary: styles.secondary,
}

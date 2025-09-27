import clsx from 'clsx'
import styles from './Button.module.scss'
import React from 'react'
import { AsChild } from '@/components/AsChild/AsChild'
import type { _buttonVariant, ButtonProps } from './ButtonProps'

export function Button({
  variant = 'primary',
  className,
  children,
  small,
  asChild,
  ref,
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
    <button ref={ref} className={classNameFinal} {...props}>
      {children}
    </button>
  )
}

const VARIANT_CLASSES: Record<_buttonVariant, string> = {
  primary: styles.primary,
  secondary: styles.secondary,
  tertiary: styles.tertiary,
}

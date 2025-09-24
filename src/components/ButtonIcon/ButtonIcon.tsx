import styles from './ButtonIcon.module.scss'
import clsx from 'clsx'

type ButtonIconProps = React.JSX.IntrinsicElements['button'] & {
  children: React.ReactNode
  variant?: 'primary' | 'transparent'
  label: string
  secondary?: boolean
}

export function ButtonIcon({
  children,
  variant = 'primary',
  label,
  className,
  secondary,
  ...props
}: ButtonIconProps) {
  return (
    <button
      className={clsx(
        styles.buttonIcon,
        {
          [styles.primary]: variant === 'primary',
          [styles.transparent]: variant === 'transparent',
          [styles.secondary]: secondary,
        },
        className
      )}
      title={label}
      aria-label={label}
      {...props}
    >
      {children}
    </button>
  )
}

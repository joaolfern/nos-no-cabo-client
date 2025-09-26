import clsx from 'clsx'
import styles from './ConfirmButton.module.scss'

type ConfirmButtonProps = React.JSX.IntrinsicElements['button']

export function ConfirmButton({
  className,
  children = 'Continuar',
  ...props
}: ConfirmButtonProps) {
  return (
    <button
      className={clsx(styles.confirmButton, className)}
      type='submit'
      {...props}
    >
      {children}
    </button>
  )
}

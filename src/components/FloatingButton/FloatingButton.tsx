import { Button } from '@/components/Button/Button'
import styles from './FloatingButton.module.scss'
import type { ButtonProps } from '@/components/Button/ButtonProps'
import clsx from 'clsx'

type FloatingButtonProps = ButtonProps & {
  ref?: React.Ref<HTMLButtonElement>
}

export function FloatingButton({
  className,
  ref,
  ...props
}: FloatingButtonProps) {
  return (
    <Button
      ref={ref}
      className={clsx(styles.floatingButton, className)}
      {...props}
    />
  )
}

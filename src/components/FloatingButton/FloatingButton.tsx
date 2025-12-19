import { Button } from '@/components/Button/Button'
import type { ButtonProps } from '@/components/Button/Button.types'
import clsx from 'clsx'
import styles from './FloatingButton.module.scss'

type FloatingButtonProps = ButtonProps & {
  ref?: React.Ref<HTMLButtonElement>
  position?: 'left' | 'right'
  padded?: boolean
}

export function FloatingButton({
  className,
  ref,
  position = 'right',
  padded,
  ...props
}: FloatingButtonProps) {
  return (
    <Button
      ref={ref}
      className={clsx(styles.floatingButton, className, {
        [styles.left]: position === 'left',
        [styles.padded]: padded,
      })}
      {...props}
    />
  )
}

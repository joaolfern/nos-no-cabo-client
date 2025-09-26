import { Button } from '@/components/Button/Button'
import styles from './FloatingButton.module.scss'
import type { ButtonProps } from '@/components/Button/ButtonProps'
import clsx from 'clsx'

type FloatingButtonProps = ButtonProps

export function FloatingButton({ className, ...props }: FloatingButtonProps) {
  return (
    <Button className={clsx(styles.floatingButton, className)} {...props} />
  )
}

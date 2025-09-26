import type { InputProps } from '@/components/Input/_InputProps'
import styles from './Input.module.scss'
import clsx from 'clsx'

export function Input({ className, ref, ...props }: InputProps) {
  return (
    <input className={clsx(styles.input, className)} ref={ref} {...props} />
  )
}

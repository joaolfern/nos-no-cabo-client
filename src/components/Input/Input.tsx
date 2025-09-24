import styles from './Input.module.scss'
import clsx from 'clsx'

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  ref?: React.Ref<HTMLInputElement>
}

export function Input({ className, ref, ...props }: InputProps) {
  return (
    <input className={clsx(styles.input, className)} ref={ref} {...props} />
  )
}

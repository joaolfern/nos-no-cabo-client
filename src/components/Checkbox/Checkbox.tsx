import clsx from 'clsx'
import { MdCheck } from 'react-icons/md'
import styles from './Checkbox.module.scss'

type CheckboxProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'onChange' | 'checked'
> & {
  checked: boolean
  onChange: (checked: boolean) => void
  label: React.ReactNode
  endContent?: React.ReactNode
}

export function Checkbox({
  checked,
  onChange,
  label,
  endContent,
  className,
  ...props
}: CheckboxProps) {
  return (
    <label className={clsx(styles.container, className)}>
      <input
        type='checkbox'
        className={styles.input}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        {...props}
      />
      <span className={styles.box} aria-hidden='true'>
        <MdCheck className={styles.check} size={14} />
      </span>
      <span className={styles.label}>{label}</span>
      {endContent && <span className={styles.end}>{endContent}</span>}
    </label>
  )
}

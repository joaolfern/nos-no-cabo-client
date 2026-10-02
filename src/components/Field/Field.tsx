import clsx from 'clsx'
import type { ReactNode } from 'react'
import styles from './Field.module.scss'
import { fieldMessageId } from './fieldMessageId'

type FieldProps = {
  id: string
  label: string
  hint?: ReactNode
  error?: ReactNode
  children: ReactNode
}

export function Field({ id, label, hint, error, children }: FieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {children}
      <p
        id={fieldMessageId(id)}
        className={clsx(styles.message, { [styles.error]: error })}
        aria-live='polite'
      >
        {error ?? hint}
      </p>
    </div>
  )
}

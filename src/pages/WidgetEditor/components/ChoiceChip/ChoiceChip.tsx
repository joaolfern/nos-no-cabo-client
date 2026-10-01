import clsx from 'clsx'
import type { ReactNode } from 'react'
import styles from './ChoiceChip.module.scss'

type ChoiceChipProps = {
  name: string
  checked: boolean
  onSelect: () => void
  children: ReactNode
  variant?: 'chip' | 'swatch' | 'card'
  title?: string
}

export function ChoiceChip({
  name,
  checked,
  onSelect,
  children,
  variant = 'chip',
  title,
}: ChoiceChipProps) {
  return (
    <label
      className={clsx(styles[variant], { [styles.checked]: checked })}
      title={title}
    >
      <input
        type='radio'
        className={styles.input}
        name={name}
        checked={checked}
        onChange={onSelect}
        aria-label={title}
      />
      {children}
    </label>
  )
}

import clsx from 'clsx'
import type { IconType } from 'react-icons'
import { LuCheck } from 'react-icons/lu'
import styles from './CategoryChip.module.scss'

type CategoryChipProps = {
  label: string
  Icon: IconType
  checked: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
}

export function CategoryChip({
  label,
  Icon,
  checked,
  disabled,
  onChange,
}: CategoryChipProps) {
  const ChipIcon = checked ? LuCheck : Icon

  return (
    <label
      className={clsx(styles.chip, {
        [styles.checked]: checked,
        [styles.disabled]: disabled,
      })}
    >
      <input
        type='checkbox'
        className={styles.input}
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <ChipIcon className={styles.icon} aria-hidden={true} />
      {label}
    </label>
  )
}

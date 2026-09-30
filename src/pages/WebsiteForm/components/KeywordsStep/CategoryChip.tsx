import clsx from 'clsx'
import type { IconType } from 'react-icons'
import { LuCheck } from 'react-icons/lu'
import styles from './CategoryChip.module.scss'

type CategoryChipProps = {
  label: string
  Icon: IconType
  checked: boolean
  onChange: (checked: boolean) => void
}

export function CategoryChip({
  label,
  Icon,
  checked,
  onChange,
}: CategoryChipProps) {
  const ChipIcon = checked ? LuCheck : Icon

  return (
    <label className={clsx(styles.chip, { [styles.checked]: checked })}>
      <input
        type='checkbox'
        className={styles.input}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <ChipIcon className={styles.icon} aria-hidden={true} />
      {label}
    </label>
  )
}

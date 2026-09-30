import clsx from 'clsx'
import { LuChevronDown } from 'react-icons/lu'
import { Dropdown } from '@/components/Dropdown/Dropdown'
import type { DropdownButtonProps } from '@/components/DropdownButton/DropdownButtonInterfaces'
import { useIsMobile } from '@/hooks/useIsMobile'
import styles from './DropdownButton.module.scss'

export function DropdownButton<T, M extends boolean | undefined>({
  label,
  labelOfSelected,
  className,
  classNames,
  ...props
}: DropdownButtonProps<T, M>) {
  const isMobile = useIsMobile()
  const hasValue = Array.isArray(props.value)
    ? props.value.length > 0
    : Boolean(props.value)

  return (
    <Dropdown
      className={className}
      classNames={{
        trigger: classNames?.trigger,
        panel: classNames?.panel,
      }}
      {...props}
    >
      <button
        type='button'
        className={clsx(
          styles.content,
          { [styles.active]: isMobile && hasValue },
          classNames?.content
        )}
      >
        <span className={clsx(styles.text, classNames?.text)}>
          {isMobile ? label : labelOfSelected}
        </span>
        <LuChevronDown className={styles.icon} data-testid='dropdown-icon' />
      </button>
    </Dropdown>
  )
}

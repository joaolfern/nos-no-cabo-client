import { Dropdown } from '@/components/Dropdown/Dropdown'
import { useRef } from 'react'
import clsx from 'clsx'
import styles from './DropdownButton.module.scss'
import type { DropdownButtonProps } from '@/components/DropdownButton/DropdownButtonInterfaces'
import { Button } from '@/components/Button/Button'
import { FaChevronDown } from 'react-icons/fa6'
import { useIsMobile } from '@/hooks/useIsMobile'

export function DropdownButton<T, M extends boolean | undefined>({
  label,
  labelOfSelected,
  className,
  classNames,
  ...props
}: DropdownButtonProps<T, M>) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const isMobile = useIsMobile()
  const hasValue = Array.isArray(props.value)
    ? props.value.length > 0
    : Boolean(props.value)

  const hasValueIndicator = isMobile && hasValue

  return (
    <div ref={containerRef} className={clsx(styles.container, className)}>
      <Dropdown
        container={containerRef.current}
        classNames={{
          trigger: clsx(styles.trigger, classNames?.trigger),
          panel: clsx(styles.panel, classNames?.panel),
        }}
        {...props}
      >
        <Button
          variant={hasValueIndicator ? 'primary' : 'secondary'}
          className={clsx(styles.content, classNames?.content)}
        >
          {isMobile ? label : labelOfSelected}
          <FaChevronDown
            size='1rem'
            className={styles.icon}
            data-testid='dropdown-icon'
          />
        </Button>
      </Dropdown>
    </div>
  )
}

import { Dropdown } from '@/components/Dropdown/Dropdown'
import { Typography } from '@/components/Typography/Typography'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useRef } from 'react'
import clsx from 'clsx'
import type { DropdownTextProps } from '@/components/DropdownText/DropdownTextInterfaces'
import styles from './DropdownText.module.scss'

export function DropdownText<T, M extends boolean | undefined>({
  children,
  valueLabel,
  Icon,
  className,
  classNames,
  ...props
}: DropdownTextProps<T, M>) {
  const isMobile = useIsMobile()
  const containerRef = useRef<HTMLDivElement | null>(null)

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
        {!isMobile && (
          <Typography variant='bodySmall' secondary={true} strong={true}>
            {children}
          </Typography>
        )}
        <button className={clsx(styles.content, classNames?.content)}>
          <Typography
            className={clsx(styles.text, classNames?.text)}
            variant='bodySmall'
          >
            {valueLabel ? String(valueLabel) : '-'}
          </Typography>
          <Icon
            size='1rem'
            className={styles.icon}
            data-testid='dropdown-icon'
          />
        </button>
      </Dropdown>
    </div>
  )
}

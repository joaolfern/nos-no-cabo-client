import { Dropdown } from '@/components/Dropdown/Dropdown'
import { Typography } from '@/components/Typography/Typography'
import { useIsMobile } from '@/hooks/useIsMobile'
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

  return (
    <Dropdown
      className={className}
      classNames={{
        trigger: clsx(styles.trigger, classNames?.trigger),
        panel: classNames?.panel,
      }}
      {...props}
    >
      {!isMobile && children && (
        <Typography color='muted' variant='bodySm'>
          {children}
        </Typography>
      )}
      <button
        type='button'
        className={clsx(styles.content, classNames?.content)}
      >
        <span className={clsx(styles.text, classNames?.text)}>
          {valueLabel ? String(valueLabel) : '-'}
        </span>
        <Icon className={styles.icon} data-testid='dropdown-icon' />
      </button>
    </Dropdown>
  )
}

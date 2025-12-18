import clsx from 'clsx'
import styles from './Menu.module.scss'
import { Typography } from '@/components/Typography/Typography'
import { MdCheck, MdOutlineInfo } from 'react-icons/md'
import type { MenuProps } from './MenuInterfaces'

export function Menu({ className, ...props }: MenuProps) {
  return <div className={clsx(styles.menu, className)} {...props}></div>
}

type MenuItemProps<T> = Omit<
  React.HTMLAttributes<HTMLButtonElement>,
  'onClick'
> & {
  selected: boolean
  onClick: (value: T) => void
  value: T
}

Menu.Item = function MenuItem<T>({
  className,
  children,
  value,
  onClick,
  selected,
  ...props
}: MenuItemProps<T>) {
  return (
    <button
      className={clsx(styles.item, className)}
      {...props}
      onClick={() => onClick(value)}
      aria-pressed={selected}
    >
      <Typography variant='body'>{children}</Typography>
      {selected && (
        <MdCheck
          className={`${styles.checkIcon} ${selected ? '' : styles.checkIconHidden}}`}
          size={16}
        />
      )}
    </button>
  )
}

Menu.Empty = function MenuEmpty() {
  return (
    <div className={styles.empty}>
      <MdOutlineInfo />
      <Typography variant='bodySmall'>Sem opções</Typography>
    </div>
  )
}

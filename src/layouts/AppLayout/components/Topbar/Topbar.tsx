import { Logo } from '@/layouts/AppLayout/components/Logo/Logo'
import styles from './Topbar.module.scss'
import { clsx } from 'clsx'

type TopbarProps = React.JSX.IntrinsicElements['header'] & {
  children: React.ReactNode
  ref?: React.Ref<HTMLElement>
  focused?: boolean
}

export function Topbar({
  children,
  ref,
  className,
  focused = false,
  ...props
}: TopbarProps) {
  return (
    <header
      className={clsx(styles.topbar, { [styles.focused]: focused }, className)}
      ref={ref}
      {...props}
    >
      <div className={styles.content}>
        <Logo />
        {children}
      </div>
    </header>
  )
}

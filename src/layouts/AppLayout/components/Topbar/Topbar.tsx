import { Logo } from '@/layouts/AppLayout/components/Logo/Logo'
import styles from './Topbar.module.scss'
import { clsx } from 'clsx'

type TopbarProps = React.JSX.IntrinsicElements['header'] & {
  children: React.ReactNode
  ref?: React.Ref<HTMLElement>
}

export function Topbar({ children, ref, className, ...props }: TopbarProps) {
  return (
    <header className={clsx(styles.topbar, className)} ref={ref} {...props}>
      <div className={styles.content}>
        <Logo />
        {children}
      </div>
    </header>
  )
}

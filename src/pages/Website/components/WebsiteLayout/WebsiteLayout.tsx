import styles from './WebsiteLayout.module.scss'
import type { NosNoCaboLayoutProps } from '@/layouts/NosNoCaboLayout/NosNoCaboLayoutInterfaces'

type WebsiteLayoutProps = NosNoCaboLayoutProps

export function WebsiteLayout({
  className,
  children,
  ...props
}: WebsiteLayoutProps) {
  return (
    <div className={styles.container} {...props}>
      {children}
    </div>
  )
}

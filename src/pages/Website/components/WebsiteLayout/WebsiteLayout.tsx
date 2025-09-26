import { NosNoCaboLayout } from '@/layouts/NosNoCaboLayout/NosNoCaboLayout'
import { InnerRouteAside } from '@/pages/NosNoCabo/components/InnerRouteAside/InnerRouteAside'
import styles from './WebsiteLayout.module.scss'
import type { NosNoCaboLayoutProps } from '@/layouts/NosNoCaboLayout/NosNoCaboLayoutInterfaces'

type WebsiteLayoutProps = NosNoCaboLayoutProps & {
  children: React.ReactNode
}

export function WebsiteLayout({
  children,
  className,
  ...props
}: WebsiteLayoutProps) {
  return (
    <NosNoCaboLayout classNames={{ content: styles.container }} {...props}>
      <InnerRouteAside />
      {children}
    </NosNoCaboLayout>
  )
}

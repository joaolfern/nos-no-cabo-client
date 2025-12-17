import type { AppLayoutProps } from '@/layouts/AppLayout/AppLayoutInterfaces'

export type NosNoCaboLayoutProps = AppLayoutProps & {
  children: React.ReactNode
  classNames?: {
    content?: string
    topbar?: string
    topbarContent?: string
  }
}

import type { AppLayoutProps } from '@/layouts/AppLayout/AppLayoutInterfaces'

export type BlogLayoutProps = AppLayoutProps & {
  children: React.ReactNode
  classNames?: {
    content?: string
    topbar?: string
  }
}

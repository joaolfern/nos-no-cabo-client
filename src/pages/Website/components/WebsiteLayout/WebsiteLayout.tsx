import { BlogLayout } from '@/layouts/BlogLayout/BlogLayout'
import { WebsiteAside } from '@/pages/Website/components/WebsiteAside/WebsiteAside'
import styles from './WebsiteLayout.module.scss'
import type { BlogLayoutProps } from '@/layouts/BlogLayout/BlogLayoutInterfaces'

type WebsiteLayoutProps = BlogLayoutProps & {
  children: React.ReactNode
}

export function WebsiteLayout({
  children,
  className,
  ...props
}: WebsiteLayoutProps) {
  return (
    <BlogLayout classNames={{ content: styles.container }} {...props}>
      <WebsiteAside />
      {children}
    </BlogLayout>
  )
}

import { AppLayout } from '@/layouts/AppLayout/AppLayout'
import { useRef } from 'react'
import { SearchFeed } from '@/layouts/BlogLayout/components/SearchFeed/SearchFeed'
import type { BlogLayoutProps } from '@/layouts/BlogLayout/BlogLayoutInterfaces'

export function BlogLayout({
  children,
  classNames,
  ...props
}: BlogLayoutProps) {
  const topbarRef = useRef<HTMLElement>(null)

  return (
    <AppLayout {...props}>
      <AppLayout.Topbar ref={topbarRef} className={classNames?.topbar}>
        <SearchFeed container={topbarRef} />
      </AppLayout.Topbar>
      <AppLayout.Content className={classNames?.content}>
        {children}
      </AppLayout.Content>
    </AppLayout>
  )
}

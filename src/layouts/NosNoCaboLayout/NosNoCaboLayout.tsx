import { AppLayout } from '@/layouts/AppLayout/AppLayout'
import { useRef } from 'react'
import { SearchFeed } from '@/layouts/NosNoCaboLayout/components/SearchFeed/SearchFeed'
import type { NosNoCaboLayoutProps } from '@/layouts/NosNoCaboLayout/NosNoCaboLayoutInterfaces'
import { ThemeSwitcher } from '@/layouts/AppLayout/components/ThemeSwitcher/ThemeSwitcher'

export function NosNoCaboLayout({
  children,
  classNames,
  ...props
}: NosNoCaboLayoutProps) {
  const topbarRef = useRef<HTMLElement>(null)

  return (
    <AppLayout {...props}>
      <AppLayout.Topbar ref={topbarRef} className={classNames?.topbar}>
        <AppLayout.TopbarContent>
          <ThemeSwitcher />
          <SearchFeed container={topbarRef} />
        </AppLayout.TopbarContent>
      </AppLayout.Topbar>
      <AppLayout.Content className={classNames?.content}>
        {children}
      </AppLayout.Content>
    </AppLayout>
  )
}

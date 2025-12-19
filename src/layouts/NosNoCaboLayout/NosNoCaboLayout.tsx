import { AppLayout } from '@/layouts/AppLayout/AppLayout'
import { useRef } from 'react'
import { SearchFeed } from '@/layouts/NosNoCaboLayout/components/SearchFeed/SearchFeed'
import type { NosNoCaboLayoutProps } from '@/layouts/NosNoCaboLayout/NosNoCaboLayoutInterfaces'
import { Outlet } from 'react-router'

export function NosNoCaboLayout({ children, ...props }: NosNoCaboLayoutProps) {
  const topbarRef = useRef<HTMLElement>(null)

  return (
    <AppLayout {...props}>
      <AppLayout.Topbar ref={topbarRef}>
        <AppLayout.TopbarContent>
          <SearchFeed container={topbarRef} />
        </AppLayout.TopbarContent>
      </AppLayout.Topbar>
      <AppLayout.Content>
        <Outlet />
      </AppLayout.Content>
    </AppLayout>
  )
}

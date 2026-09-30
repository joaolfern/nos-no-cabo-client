import { AppLayout } from '@/layouts/AppLayout/AppLayout'
import { useRef } from 'react'
import { SearchFeed } from '@/layouts/NosNoCaboLayout/components/SearchFeed/SearchFeed'
import { TopbarActions } from '@/layouts/NosNoCaboLayout/components/TopbarActions/TopbarActions'
import type { NosNoCaboLayoutProps } from '@/layouts/NosNoCaboLayout/NosNoCaboLayoutInterfaces'
import { Outlet } from 'react-router'

export function NosNoCaboLayout({
  children,
  variant = 'wide',
  ...props
}: NosNoCaboLayoutProps) {
  const topbarRef = useRef<HTMLElement>(null)
  const isFocused = variant === 'focused'

  return (
    <AppLayout variant={variant} {...props}>
      <AppLayout.Topbar ref={topbarRef} focused={isFocused}>
        {!isFocused && (
          <AppLayout.TopbarContent>
            <SearchFeed container={topbarRef} />
          </AppLayout.TopbarContent>
        )}
        <TopbarActions showAddSite={!isFocused} />
      </AppLayout.Topbar>
      <AppLayout.Content>
        <Outlet />
      </AppLayout.Content>
    </AppLayout>
  )
}

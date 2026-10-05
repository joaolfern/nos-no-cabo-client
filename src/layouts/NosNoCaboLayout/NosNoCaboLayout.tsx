import { AppLayout } from '@/layouts/AppLayout/AppLayout'
import { Suspense, useRef } from 'react'
import { SiteFooter } from '@/layouts/NosNoCaboLayout/components/SiteFooter/SiteFooter'
import { SearchFeed } from '@/layouts/NosNoCaboLayout/components/SearchFeed/SearchFeed'
import { TopbarActions } from '@/layouts/NosNoCaboLayout/components/TopbarActions/TopbarActions'
import type { NosNoCaboLayoutProps } from '@/layouts/NosNoCaboLayout/NosNoCaboLayoutInterfaces'
import { Outlet } from 'react-router'
import styles from './NosNoCaboLayout.module.scss'

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
        {/* The topbar stays while a page's chunk loads; the filler keeps the footer below the fold. */}
        <Suspense fallback={<div className={styles.pageLoading} />}>
          <Outlet />
        </Suspense>
        <SiteFooter />
      </AppLayout.Content>
    </AppLayout>
  )
}

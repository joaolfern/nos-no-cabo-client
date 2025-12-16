import { Topbar } from '@/layouts/AppLayout/components/Topbar/Topbar'
import styles from './AppLayout.module.scss'
import { BackgroundEffect } from '@/layouts/AppLayout/components/BackgroundEffect/BackgroundEffect'
import type { AppLayoutProps } from '@/layouts/AppLayout/AppLayoutInterfaces'
import clsx from 'clsx'

export function AppLayout({ children, className, ...props }: AppLayoutProps) {
  return (
    <>
      <BackgroundEffect />
      <section className={clsx(styles.container, className)} {...props}>
        {children}
      </section>
    </>
  )
}

type TopbarContentProps = React.JSX.IntrinsicElements['div']

export function TopbarContent({ className, ...props }: TopbarContentProps) {
  return <div className={clsx(styles.topbarContent, className)} {...props} />
}

type ContentProps = React.JSX.IntrinsicElements['main'] & {
  children: React.ReactNode
}

function Content({ children, className, ...props }: ContentProps) {
  return (
    <main className={clsx(styles.content, className)} {...props}>
      {children}
    </main>
  )
}

AppLayout.Topbar = Topbar
AppLayout.Content = Content
AppLayout.TopbarContent = TopbarContent

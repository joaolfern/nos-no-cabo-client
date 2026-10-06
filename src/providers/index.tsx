import { QueryProvider } from './QueryProvider/QueryProvider'
import { IconProvider } from './IconProvider/IconProvider'
import { ErrorBoundary } from './ErrorBoundary/ErrorBoundary'
import { NosNoCaboProviders } from '@/pages/Webring/providers/NosNoCaboProviders'
import { ThemeProvider } from '@/providers/ThemeProvider/ThemeProvider'
import { RouterProvider } from '@/providers/RouterProvider/RouterProvider'
import { MessageProvider } from '@/providers/MessageProvider/MessageProvider'

type ProvidersProps = {
  children: React.ReactNode
}

// Everything the app needs except the router, so the data router can wrap it (see AppRouter).
export function AppProviders({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <MessageProvider>
        <ErrorBoundary>
          <QueryProvider>
            <IconProvider>
              <NosNoCaboProviders>{children}</NosNoCaboProviders>
            </IconProvider>
          </QueryProvider>
        </ErrorBoundary>
      </MessageProvider>
    </ThemeProvider>
  )
}

// Tests render pages with <Routes>, which needs a component router around them.
export function Providers({ children }: ProvidersProps) {
  return (
    <RouterProvider>
      <AppProviders>{children}</AppProviders>
    </RouterProvider>
  )
}

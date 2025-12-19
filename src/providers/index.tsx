import { QueryProvider } from './QueryProvider/QueryProvider'
import { IconProvider } from './IconProvider/IconProvider'
import { ErrorBoundary } from './ErrorBoundary/ErrorBoundary'
import { NosNoCaboProviders } from '@/pages/Webring/providers/NosNoCaboProviders'
import { ThemeProvider } from '@/providers/ThemeProvider/ThemeProvider'
import { RouterProvider } from '@/providers/RouterProvider/RouterProvider'

type ProvidersProps = {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <RouterProvider>
      <ThemeProvider>
        <ErrorBoundary>
          <QueryProvider>
            <IconProvider>
              <NosNoCaboProviders>{children}</NosNoCaboProviders>
            </IconProvider>
          </QueryProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </RouterProvider>
  )
}

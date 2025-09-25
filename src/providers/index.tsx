import { QueryProvider } from './QueryProvider/QueryProvider'
import { IconProvider } from './IconProvider/IconProvider'
import { ErrorBoundary } from './ErrorBoundary/ErrorBoundary'
import { BlogProviders } from '@/pages/Blog/providers/BlogProviders'

type ProvidersProps = {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <IconProvider>
          <BlogProviders>{children}</BlogProviders>
        </IconProvider>
      </QueryProvider>
    </ErrorBoundary>
  )
}

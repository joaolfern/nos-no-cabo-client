import { QueryProvider } from './QueryProvider/QueryProvider'
import { IconProvider } from './IconProvider/IconProvider'
import { ErrorBoundary } from './ErrorBoundary/ErrorBoundary'
import { NosNoCaboProviders } from '@/pages/NosNoCabo/providers/NosNoCaboProviders'

type ProvidersProps = {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <IconProvider>
          <NosNoCaboProviders>{children}</NosNoCaboProviders>
        </IconProvider>
      </QueryProvider>
    </ErrorBoundary>
  )
}

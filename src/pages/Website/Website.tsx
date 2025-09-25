import { ErrorBoundary } from '@/providers/ErrorBoundary/ErrorBoundary'
import { WebsiteContent } from '@/pages/Website/components/WebsiteContent/WebsiteContent'
import { WebsiteLayout } from '@/pages/Website/components/WebsiteLayout/WebsiteLayout'
import { WebsiteDetailsProvider } from '@/providers/WebsiteProvider/WebsiteProvider'

type WebsiteProps = {
  id: string
}

export function Website({ id }: WebsiteProps) {
  return (
    <WebsiteDetailsProvider id={id}>
      <WebsiteLayout>
        <ErrorBoundary>
          <WebsiteContent />
        </ErrorBoundary>
      </WebsiteLayout>
    </WebsiteDetailsProvider>
  )
}

import { ErrorBoundary } from '@/providers/ErrorBoundary/ErrorBoundary'
import { WebsiteContent } from '@/pages/Website/components/WebsiteContent/WebsiteContent'
import { WebsiteDetailsProvider } from '@/providers/WebsiteProvider/WebsiteProvider'
import { useParams } from 'react-router'
import { WebsiteLayout } from '@/pages/Website/components/WebsiteLayout/WebsiteLayout'

export function Website() {
  const { id } = useParams<{ id: string }>()

  if (!id) {
    return <div>Website não encontrado.</div>
  }

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

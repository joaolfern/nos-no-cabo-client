import { FiltersProvider } from '@/providers/FiltersProvider/FiltersProvider'
import { WebsitesProvider } from '@/providers/WebsitesProvider/WebsitesProvider'
import { SortProvider } from '@/providers/SortProvider/SortProvider'

type BlogProvidersProps = {
  children: React.ReactNode
}

export function BlogProviders({ children }: BlogProvidersProps) {
  return (
    <SortProvider>
      <FiltersProvider>
        <WebsitesProvider>{children}</WebsitesProvider>
      </FiltersProvider>
    </SortProvider>
  )
}

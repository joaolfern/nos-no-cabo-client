import { FiltersProvider } from '@/providers/FiltersProvider/FiltersProvider'
import { WebsitesProvider } from '@/providers/WebsitesProvider/WebsitesProvider'
import { SortProvider } from '@/providers/SortProvider/SortProvider'

type NosNoCaboProvidersProps = {
  children: React.ReactNode
}

export function NosNoCaboProviders({ children }: NosNoCaboProvidersProps) {
  return (
    <SortProvider>
      <FiltersProvider>
        <WebsitesProvider>{children}</WebsitesProvider>
      </FiltersProvider>
    </SortProvider>
  )
}

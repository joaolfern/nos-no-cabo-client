import { FiltersProvider } from '@/providers/FiltersProvider/FiltersProvider'
import { SortProvider } from '@/providers/SortProvider/SortProvider'

type NosNoCaboProvidersProps = {
  children: React.ReactNode
}

export function NosNoCaboProviders({ children }: NosNoCaboProvidersProps) {
  return (
    <SortProvider>
      <FiltersProvider>{children}</FiltersProvider>
    </SortProvider>
  )
}

import { useMemo, type ReactNode } from 'react'
import { FiltersContext } from '@/contexts/FiltersContext'
import type { IFiltersContext } from '@/interfaces/IFilters'
import { useKeywordFilter } from '@/providers/FiltersProvider/hooks/useKeywordFilter'
import { useSearch } from '@/providers/FiltersProvider/hooks/useSearch'

type FiltersProviderProps = {
  children: ReactNode
}

export function FiltersProvider({ children }: FiltersProviderProps) {
  const {
    selectedKeywords,
    keywordOptions,
    updateKeywords,
    getKeywordById,
    keywordIsLoading,
    filterByKeyword,
  } = useKeywordFilter()

  const { search, updateSearch, filterBySearch } = useSearch()

  const value = useMemo<IFiltersContext>(
    () => ({
      selectedKeywords,
      keywordOptions,
      updateKeywords,
      getKeywordById,
      keywordIsLoading,
      filterByKeyword,
      search,
      updateSearch,
      filterBySearch,
    }),
    [
      selectedKeywords,
      keywordOptions,
      updateKeywords,
      getKeywordById,
      keywordIsLoading,
      filterByKeyword,
      search,
      updateSearch,
      filterBySearch,
    ]
  )

  return (
    <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>
  )
}

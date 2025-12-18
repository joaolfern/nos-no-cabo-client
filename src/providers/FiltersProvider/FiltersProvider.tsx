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
    clearKeywords,
  } = useKeywordFilter()

  const { search, updateSearch, filterBySearch, clearSearch } = useSearch()

  const hasFilters = useMemo(
    () => selectedKeywords.length > 0,
    [selectedKeywords]
  )

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
      clearSearch,
      hasFilters,
      clearKeywords,
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
      clearSearch,
      hasFilters,
      clearKeywords,
    ]
  )

  return (
    <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>
  )
}

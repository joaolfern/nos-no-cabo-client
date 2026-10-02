import { useCallback, useState } from 'react'

export function useSearch() {
  const [search, setSearch] = useState<string>('')

  const updateSearch = useCallback((search: string) => {
    setSearch(search)
  }, [])

  const clearSearch = useCallback(() => {
    setSearch('')
  }, [])

  return {
    search,
    updateSearch,
    clearSearch,
  }
}

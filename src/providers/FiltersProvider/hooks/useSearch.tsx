import { useCallback, useState } from 'react'
import type { IWebsite } from '@/interfaces/IWebsite'
import { standardizeString } from '@/utils/standardize'

export function useSearch() {
  const [search, setSearch] = useState<string>('')

  const filterBySearch = useCallback(
    (websites: IWebsite[], search: string): IWebsite[] => {
      if (!search) return websites
      const searchRegex = new RegExp(standardizeString(search).trim(), 'i')

      return websites.filter((website) => {
        const title = standardizeString(website.name)
        const description = standardizeString(website.description || '')

        return searchRegex.test(title) || searchRegex.test(description)
      })
    },
    []
  )
  const updateSearch = useCallback((search: string) => {
    setSearch(search)
  }, [])

  return {
    search,
    updateSearch,
    filterBySearch,
  }
}

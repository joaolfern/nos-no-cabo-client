import { useCallback, useEffect, useState } from 'react'
import styles from './SearchFeed.module.scss'
import { Search } from '@/components/Search/Search'
import { useFilters } from '@/pages/Feed/hooks/useFilters'
import { useDebounce } from '@/hooks/useDebounce'
import { useLocation } from 'react-router'

interface SearchFeedProps {
  container: React.RefObject<HTMLElement | null>
}

export function SearchFeed({ container }: SearchFeedProps) {
  const { search: currentSearch } = useLocation()
  const [value, setValue] = useState<string>(() => {
    const params = new URLSearchParams(currentSearch)
    return params.get('s') || ''
  })
  const { updateSearch } = useFilters()
  const debouncedValue = useDebounce(value)

  const handleUpdateSearch = useCallback(
    (search: string) => {
      updateSearch(search)

      // Only the search's own parameter changes; the category filter stays in the address.
      const params = new URLSearchParams(window.location.search)
      if (search) params.set('s', search)
      else params.delete('s')

      const query = params.toString()
      // Keep the router's history state: it holds the key scroll positions are saved under.
      window.history.replaceState(
        window.history.state,
        '',
        query ? `?${query}` : window.location.pathname
      )
    },
    [updateSearch]
  )

  useEffect(() => {
    handleUpdateSearch(debouncedValue)
  }, [debouncedValue, handleUpdateSearch])

  function handleChange(value: string) {
    setValue(value)

    if (value === '') handleUpdateSearch(value)
  }

  return (
    <Search
      container={container}
      className={styles.search}
      classNames={{ contentFocused: styles.focused }}
      placeholder='Buscar projetos…'
      value={value}
      onChange={handleChange}
    />
  )
}

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

      const currentParams = new URLSearchParams()

      currentParams.set('s', search)

      if (!search) {
        currentParams.delete('s')
      }

      const newSearch = currentParams.toString()

      if (newSearch) window.history.replaceState(null, '', `?${newSearch}`)
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
      placeholder='Search'
      value={value}
      onChange={handleChange}
    />
  )
}

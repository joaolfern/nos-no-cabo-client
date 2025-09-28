import { useCallback, useEffect, useState } from 'react'
import styles from './SearchFeed.module.scss'
import { Search } from '@/components/Search/Search'
import { useFilters } from '@/pages/Feed/hooks/useFilters'
import { useDebounce } from '@/hooks/useDebounce'
import { storeInUrl } from '@/utils/storeInUrl/storeInUrl'

interface SearchFeedProps {
  container: React.RefObject<HTMLElement | null>
}

export function SearchFeed({ container }: SearchFeedProps) {
  const [value, setValue] = useState<string>('')
  const { updateSearch } = useFilters()
  const debouncedValue = useDebounce(value)

  const handleUpdateSearch = useCallback(
    (search: string) => {
      updateSearch(search)

      const url = new URL(window.location.href)

      storeInUrl(url, { search })
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

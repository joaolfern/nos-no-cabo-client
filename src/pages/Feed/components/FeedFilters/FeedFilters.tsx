import { useMemo, useRef, useState } from 'react'
import { LuFilter, LuTag } from 'react-icons/lu'
import { DropdownButton } from '@/components/DropdownButton/DropdownButton'
import { Input } from '@/components/Input/Input'
import type { IFilterEvent } from '@/interfaces/IFilters'
import { CategoryList } from '@/pages/Feed/components/CategoryList/CategoryList'
import { FeedPromo } from '@/pages/Feed/components/FeedPromo/FeedPromo'
import { SocialLinks } from '@/pages/Feed/components/SocialLinks/SocialLinks'
import { useFilters } from '@/pages/Feed/hooks/useFilters'
import { useFittingRowCount } from '@/pages/Feed/hooks/useFittingRowCount'
import { useWebsites } from '@/pages/Feed/hooks/useWebsites'
import {
  countWebsitesByKeyword,
  sortByCountDesc,
} from '@/pages/Feed/utils/keywordCounts'
import { MIN_VISIBLE_CATEGORIES } from '@/pages/Feed/utils/splitVisibleCategories'
import { standardizeString } from '@/utils/standardize'
import styles from './FeedFilters.module.scss'

const MIN_CATEGORY_ROWS = MIN_VISIBLE_CATEGORIES + 2

type FeedFiltersProps = {
  onChange: (filter?: IFilterEvent) => void
}

export function FeedFilters() {}

FeedFilters.Inline = function FeedFiltersInline({
  onChange,
}: FeedFiltersProps) {
  return (
    <div className={styles.inline}>
      <KeywordFilter onChange={onChange} />
    </div>
  )
}

FeedFilters.Panel = function FeedFiltersPanel({ onChange }: FeedFiltersProps) {
  const {
    keywordOptions,
    keywordIsLoading,
    selectedKeywords,
    updateKeywords,
    clearKeywords,
  } = useFilters()
  const { updateWebsites, websitesRaw } = useWebsites()
  const [keywordQuery, setKeywordQuery] = useState('')
  const selected = selectedKeywords[0] ?? null
  const categoriesRef = useRef<HTMLDivElement>(null)
  const { capacity, heightForRows } = useFittingRowCount(categoriesRef, 'nav')

  // Counts ignore the active filters on purpose, so they stay stable while
  // the user switches categories.
  const counts = useMemo(
    () => countWebsitesByKeyword(websitesRaw),
    [websitesRaw]
  )

  const categoryOptions = useMemo(() => {
    const query = standardizeString(keywordQuery).trim()

    // A keyword no project uses can only produce an empty feed, so it is
    // hidden unless it is already selected.
    const inUse = keywordOptions.filter(
      (option) =>
        (counts.get(option.value) ?? 0) > 0 || option.value === selected
    )
    const matching = query
      ? inUse.filter((option) =>
          standardizeString(option.label).includes(query)
        )
      : inUse

    return sortByCountDesc(matching, counts)
  }, [keywordOptions, keywordQuery, counts, selected])

  function clearSelection() {
    clearKeywords()

    if (websitesRaw) {
      updateWebsites(websitesRaw)
    }
  }

  function clear() {
    setKeywordQuery('')
    clearSelection()
  }

  function handleSelect(value: string | null) {
    if (value === null) {
      clearSelection()
      return
    }

    onChange(updateKeywords(value))
  }

  return (
    <aside className={styles.panel}>
      <div className={styles.sticky}>
        <header className={styles.header}>
          <h2 className={styles.heading}>
            <LuFilter aria-hidden={true} />
            Filtros
          </h2>
          <button type='button' className={styles.clear} onClick={clear}>
            Limpar
          </button>
        </header>

        <div className={styles.search}>
          <LuTag className={styles.searchIcon} aria-hidden={true} />
          <Input
            className={styles.searchInput}
            value={keywordQuery}
            onChange={(event) => setKeywordQuery(event.target.value)}
            placeholder='Palavras-chave'
            aria-label='Buscar palavras-chave'
            autoComplete='off'
          />
        </div>

        <div
          ref={categoriesRef}
          className={styles.categories}
          style={{ minHeight: heightForRows(MIN_CATEGORY_ROWS) }}
        >
          <CategoryList
            options={categoryOptions}
            counts={counts}
            total={websitesRaw?.length ?? 0}
            selected={selected}
            loading={keywordIsLoading}
            onSelect={handleSelect}
            maxRows={capacity}
          />
        </div>

        <div className={styles.footer}>
          <FeedPromo />
          <SocialLinks />
        </div>
      </div>
    </aside>
  )
}

function KeywordFilter({ onChange }: Partial<FeedFiltersProps>) {
  const {
    keywordOptions,
    selectedKeywords,
    updateKeywords,
    getKeywordById,
    keywordIsLoading,
  } = useFilters()
  const selected = selectedKeywords[0] ?? ''

  function handleChange(value: string) {
    const props = updateKeywords(value)

    if (onChange) {
      onChange(props)
    }
  }

  return (
    <DropdownButton
      label='Palavras-chave'
      labelOfSelected={getKeywordById(selected)?.name ?? ''}
      onChange={handleChange}
      options={keywordOptions}
      value={selected}
      multiple={false}
      loading={keywordIsLoading}
    />
  )
}

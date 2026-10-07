import { useMemo, useRef, useState } from 'react'
import { LuFilter, LuTag } from 'react-icons/lu'
import { DropdownButton } from '@/components/DropdownButton/DropdownButton'
import { Input } from '@/components/Input/Input'
import { CategoryList } from '@/pages/Feed/components/CategoryList/CategoryList'
import { FeedPromo } from '@/pages/Feed/components/FeedPromo/FeedPromo'
import { SocialLinks } from '@/pages/Feed/components/SocialLinks/SocialLinks'
import { useFilters } from '@/pages/Feed/hooks/useFilters'
import { useFittingRowCount } from '@/pages/Feed/hooks/useFittingRowCount'
import { useCategoriesData } from '@/hooks/useDataHooks'
import { countsBySlug, sortByCountDesc } from '@/pages/Feed/utils/keywordCounts'
import { getCategoryMeta } from '@/pages/Feed/constants/categories'
import { MIN_VISIBLE_CATEGORIES } from '@/pages/Feed/utils/splitVisibleCategories'
import { standardizeString } from '@/utils/standardize'
import styles from './FeedFilters.module.scss'

const MIN_CATEGORY_ROWS = MIN_VISIBLE_CATEGORIES + 2

export function FeedFilters() {}

FeedFilters.Inline = function FeedFiltersInline() {
  return (
    <div className={styles.inline}>
      <KeywordFilter />
    </div>
  )
}

FeedFilters.Panel = function FeedFiltersPanel() {
  const {
    keywordOptions,
    keywordIsLoading,
    selectedKeywords,
    updateKeywords,
    clearKeywords,
    getKeywordById,
  } = useFilters()
  const { data: categories } = useCategoriesData()
  const [categoryQuery, setCategoryQuery] = useState('')
  const selected = selectedKeywords[0] ?? null
  const categoriesRef = useRef<HTMLDivElement>(null)
  const { capacity, heightForRows } = useFittingRowCount(categoriesRef, 'nav')

  // Counts ignore the active filters on purpose, so they stay stable while
  // the user switches categories.
  const counts = useMemo(() => countsBySlug(categories), [categories])

  const categoryOptions = useMemo(() => {
    const query = standardizeString(categoryQuery).trim()

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

    return sortByCountDesc(matching, counts).map((option) => ({
      ...option,
      Icon: getCategoryMeta(getKeywordById(option.value)?.name ?? '').Icon,
    }))
  }, [keywordOptions, categoryQuery, counts, selected, getKeywordById])

  function clear() {
    setCategoryQuery('')
    clearKeywords()
  }

  function handleSelect(value: string | null) {
    if (value === null) {
      clearKeywords()
      return
    }

    updateKeywords(value)
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

        <div
          ref={categoriesRef}
          className={styles.categories}
          style={{ minHeight: heightForRows(MIN_CATEGORY_ROWS) }}
        >
          <CategoryList
            options={categoryOptions}
            counts={counts}
            total={categories?.total ?? 0}
            selected={selected}
            loading={keywordIsLoading}
            onSelect={handleSelect}
            maxRows={capacity}
            search={
              <div className={styles.search}>
                <LuTag className={styles.searchIcon} aria-hidden={true} />
                <Input
                  className={styles.searchInput}
                  value={categoryQuery}
                  onChange={(event) => setCategoryQuery(event.target.value)}
                  placeholder='Filtrar categorias'
                  aria-label='Filtrar categorias'
                  autoComplete='off'
                />
              </div>
            }
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

function KeywordFilter() {
  const { keywordOptions, selectedKeywords, updateKeywords, keywordIsLoading } =
    useFilters()
  const selected = selectedKeywords[0] ?? ''
  const { data: categories } = useCategoriesData()
  const selectedLabel =
    keywordOptions.find((option) => option.value === selected)?.label ?? ''
  const optionsByCount = useMemo(
    () => sortByCountDesc(keywordOptions, countsBySlug(categories)),
    [keywordOptions, categories]
  )

  return (
    <DropdownButton
      label='Categorias'
      labelOfSelected={selectedLabel}
      onChange={updateKeywords}
      options={optionsByCount}
      value={selected}
      multiple={false}
      loading={keywordIsLoading}
    />
  )
}

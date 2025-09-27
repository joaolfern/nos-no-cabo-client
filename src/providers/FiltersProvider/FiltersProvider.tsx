import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { useKeywordsData } from '@/hooks/useDataHooks'
import { FiltersContext } from '@/contexts/FiltersContext'
import type { IFiltersContext, IFilterEvent } from '@/interfaces/IFilters'
import type { IKeyword, IWebsite } from '@/interfaces/IWebsite'

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

  const value = useMemo<IFiltersContext>(
    () => ({
      selectedKeywords,
      keywordOptions,
      updateKeywords,
      getKeywordById,
      keywordIsLoading,
      filterByKeyword,
    }),
    [
      selectedKeywords,
      keywordOptions,
      updateKeywords,
      getKeywordById,
      keywordIsLoading,
      filterByKeyword,
    ]
  )

  return (
    <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>
  )
}

function useKeywordFilter() {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])
  const { data: keywords, isLoading: keywordIsLoading } = useKeywordsData()

  const keywordsMap = useMemo(() => {
    const map = new Map<string, IKeyword>()
    keywords?.forEach((keyword) => map.set(keyword.id, keyword))
    return map
  }, [keywords])

  const getKeywordById = useCallback(
    (id: string) => keywordsMap.get(id),
    [keywordsMap]
  )

  const keywordOptions = useMemo(
    () =>
      keywords
        ? keywords.map((keyword) => ({
            label: keyword.name,
            value: keyword.id,
          }))
        : [],
    [keywords]
  )

  const updateKeywords = useCallback(
    (changedItem: string): IFilterEvent => {
      const isAdding = !selectedKeywords.includes(changedItem)

      if (isAdding) {
        setSelectedKeywords((prev) => addToList(prev, changedItem))

        return {
          updatedKeywords: addToList(selectedKeywords, changedItem),
        }
      } else {
        setSelectedKeywords((prev) => removeFromList(prev, changedItem))

        return {
          updatedKeywords: removeFromList(selectedKeywords, changedItem),
        }
      }
    },
    [selectedKeywords]
  )

  const filterByKeyword = useCallback(
    (websites: IWebsite[], selectedKeywords: string[]): IWebsite[] => {
      if (selectedKeywords.length === 0) return websites

      return websites.filter((website) =>
        website.keywords.some((keyword) =>
          selectedKeywords.includes(keyword.id)
        )
      )
    },
    []
  )

  return {
    selectedKeywords,
    keywordOptions,
    updateKeywords,
    getKeywordById,
    keywordIsLoading,
    filterByKeyword,
  }
}

function addToList(list: string[], item: string) {
  return [...list, item]
}

function removeFromList(list: string[], item: string) {
  return list.filter((id) => id !== item)
}

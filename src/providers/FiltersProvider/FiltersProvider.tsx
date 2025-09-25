import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { useAuthorsData, useKeywordsData } from '@/hooks/useDataHooks'
import { FiltersContext } from '@/contexts/FiltersContext'
import type { IFiltersContext, IFilterEvent } from '@/interfaces/IFilters'
import type { IAuthor } from '@/interfaces/IAuthor'
import { getLastName } from '@/utils/getLastName/getLastName'
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

  const {
    selectedAuthors,
    authorOptions,
    updateAuthors,
    getAuthorById,
    authorIsLoading,
    filterByAuthor,
  } = useAuthorFilter()

  const value = useMemo<IFiltersContext>(
    () => ({
      selectedKeywords,
      keywordOptions,
      updateKeywords,
      getKeywordById,
      keywordIsLoading,
      filterByKeyword,

      selectedAuthors,
      authorOptions,
      updateAuthors,
      getAuthorById,
      authorIsLoading,
      filterByAuthor,
    }),
    [
      selectedKeywords,
      keywordOptions,
      updateKeywords,
      getKeywordById,
      selectedAuthors,
      authorOptions,
      updateAuthors,
      getAuthorById,
      authorIsLoading,
      keywordIsLoading,
      filterByAuthor,
      filterByKeyword,
    ]
  )

  return (
    <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>
  )
}

function useAuthorFilter() {
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([])
  const { data: authors, isLoading: authorIsLoading } = useAuthorsData()

  const authorsMap = useMemo(() => {
    const map = new Map<string, IAuthor>()
    authors?.forEach((author) => map.set(author.id, author))
    return map
  }, [authors])

  const getAuthorById = useCallback(
    (id: string) => authorsMap.get(id),
    [authorsMap]
  )

  const authorOptions = useMemo(
    () =>
      authors
        ? authors.map((author) => ({
            label: getLastName(author.name),
            value: author.id,
          }))
        : [],
    [authors]
  )

  const updateAuthors = useCallback(
    (changedItem: string): IFilterEvent => {
      const isAdding = !selectedAuthors.includes(changedItem)

      if (isAdding) {
        setSelectedAuthors((prev) => addToList(prev, changedItem))

        return {
          updatedAuthors: addToList(selectedAuthors, changedItem),
        }
      } else {
        setSelectedAuthors((prev) => removeFromList(prev, changedItem))

        return {
          updatedAuthors: removeFromList(selectedAuthors, changedItem),
        }
      }
    },
    [selectedAuthors]
  )

  const filterByAuthor = useCallback(
    (websites: IWebsite[], selectedAuthors: string[]): IWebsite[] => {
      if (selectedAuthors.length === 0) return websites

      return websites.filter((website) =>
        selectedAuthors.includes(website.author.id)
      )
    },
    []
  )

  return {
    selectedAuthors,
    authorOptions,
    updateAuthors,
    getAuthorById,
    authorIsLoading,
    filterByAuthor,
  }
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

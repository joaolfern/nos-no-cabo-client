import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { useKeywordsData } from '@/hooks/useDataHooks'
import type { IKeyword, IWebsite } from '@/interfaces/IWebsite'
import {
  getCategoryLabel,
  sortByCategoryOrder,
} from '@/pages/Feed/constants/categories'

export const CATEGORY_SEARCH_PARAM = 'categoria'

export function useKeywordFilter() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: keywords, isLoading: keywordIsLoading } = useKeywordsData()
  const selectedName = searchParams.get(CATEGORY_SEARCH_PARAM)

  const keywordsMap = useMemo(() => {
    const map = new Map<string, IKeyword>()
    keywords?.forEach((keyword) => map.set(keyword.id, keyword))
    return map
  }, [keywords])

  const selectedKeywords = useMemo(() => {
    const selected = keywords?.find((keyword) => keyword.name === selectedName)
    return selected ? [selected.id] : []
  }, [keywords, selectedName])

  const getKeywordById = useCallback(
    (id: string) => keywordsMap.get(id),
    [keywordsMap]
  )

  const keywordOptions = useMemo(
    () =>
      sortByCategoryOrder(keywords ?? []).map((keyword) => ({
        label: getCategoryLabel(keyword.name),
        value: keyword.id,
      })),
    [keywords]
  )

  const setSelectedName = useCallback(
    (name: string | undefined) => {
      setSearchParams(
        (params) => {
          if (name) params.set(CATEGORY_SEARCH_PARAM, name)
          else params.delete(CATEGORY_SEARCH_PARAM)
          return params
        },
        { replace: true }
      )
    },
    [setSearchParams]
  )

  const updateKeywords = useCallback(
    (id: string) => setSelectedName(keywordsMap.get(id)?.name),
    [keywordsMap, setSelectedName]
  )

  const clearKeywords = useCallback(
    () => setSelectedName(undefined),
    [setSelectedName]
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
    clearKeywords,
  }
}

import type { IKeyword } from '@/interfaces/IWebsite'

export interface IFiltersContext {
  selectedKeywords: string[]
  keywordOptions: { label: string; value: string }[]
  updateKeywords: (id: string) => void
  getKeywordById: (id: string) => IKeyword | undefined
  keywordIsLoading: boolean
  search: string
  updateSearch: (search: string) => void
  clearSearch: () => void
  hasFilters: boolean
  clearKeywords: () => void
}

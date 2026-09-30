import type { IKeyword, IWebsite } from '@/interfaces/IWebsite'

export interface IFiltersContext {
  selectedKeywords: string[]
  keywordOptions: { label: string; value: string }[]
  updateKeywords: (id: string) => void
  getKeywordById: (id: string) => IKeyword | undefined
  keywordIsLoading: boolean
  filterByKeyword: (
    websites: IWebsite[],
    selectedKeywords: string[]
  ) => IWebsite[]
  search: string
  updateSearch: (search: string) => void
  filterBySearch: (websites: IWebsite[], search: string) => IWebsite[]
  clearSearch: () => void
  hasFilters: boolean
  clearKeywords: () => void
}

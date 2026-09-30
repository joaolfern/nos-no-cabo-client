import React from 'react'
import type { IFiltersContext } from '@/interfaces/IFilters'

const INITIAL_STATE: IFiltersContext = {
  selectedKeywords: [],
  keywordOptions: [],
  updateKeywords: () => {},
  getKeywordById: () => undefined,
  keywordIsLoading: false,
  filterByKeyword: () => [],
  search: '',
  updateSearch: () => {},
  filterBySearch: () => [],
  clearKeywords: () => {},
  clearSearch: () => {},
  hasFilters: true,
}

export const FiltersContext =
  React.createContext<IFiltersContext>(INITIAL_STATE)

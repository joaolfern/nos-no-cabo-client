import React from 'react'
import type { IFilterEvent, IFiltersContext } from '@/interfaces/IFilters'

const INITIAL_STATE: IFiltersContext = {
  selectedKeywords: [],
  keywordOptions: [],
  updateKeywords: () => ({}) as unknown as IFilterEvent,
  getKeywordById: () => undefined,
  keywordIsLoading: false,
  filterByKeyword: () => [],
  search: '',
  updateSearch: () => ({}) as unknown as IFilterEvent,
  filterBySearch: () => [],
}

export const FiltersContext =
  React.createContext<IFiltersContext>(INITIAL_STATE)

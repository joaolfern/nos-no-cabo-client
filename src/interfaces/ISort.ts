import type { WEBSITE_SORTS } from '@nosnocabo/contract'

// The server sorts; these are the API's own values.
export type _sortType = (typeof WEBSITE_SORTS)[number]

export interface ISort {
  label: string
  value: _sortType
}

export interface ISortContext {
  selectedSort: _sortType
  sortOptions: ISort[]
  updateSort: (changedItem: _sortType) => void
  getSortById: (id: string) => ISort | undefined
}

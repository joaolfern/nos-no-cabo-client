export type _sortType = 'date_asc' | 'date_desc' | 'title_asc' | 'title_desc'

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

import type { DropdownOption } from '@/components/Dropdown/DropdownInterfaces'
import type { _sortType } from '@/interfaces/ISort'

export const WEBSITES_SORT_OPTIONS: DropdownOption<_sortType>[] = [
  { label: 'Mais novos', value: 'date_desc' },
  { label: 'Mais curtidos', value: 'likes_desc' },
  { label: 'A–Z', value: 'title_asc' },
]

export const DEFAULT_WEBSITES_SORT_OPTION = WEBSITES_SORT_OPTIONS[0]

export const FEED_PAGE_SIZE = 12
export const FEED_PAGE_SIZE_LARGE = 18

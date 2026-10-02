import type { DropdownOption } from '@/components/Dropdown/DropdownInterfaces'
import type { _sortType } from '@/interfaces/ISort'

export const WEBSITES_SORT_OPTIONS: DropdownOption<_sortType>[] = [
  { label: 'Melhores', value: 'melhores' },
  { label: 'Mais novos', value: 'recentes' },
  { label: 'Mais curtidos', value: 'curtidos' },
  { label: 'A–Z', value: 'az' },
]

export const DEFAULT_WEBSITES_SORT_OPTION = WEBSITES_SORT_OPTIONS[0]

export const FEED_PAGE_SIZE = 12
export const FEED_PAGE_SIZE_LARGE = 18

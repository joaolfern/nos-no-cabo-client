import type { DropdownOption } from '@/components/Dropdown/DropdownInterfaces'
import type { _sortType } from '@/interfaces/ISort'

export const WEBSITES_SORT_OPTIONS: DropdownOption<_sortType>[] = [
  { label: 'Mais novos', value: 'date_desc' },
  { label: 'Mais antigos', value: 'date_asc' },
  { label: 'Título A-Z', value: 'title_asc' },
  { label: 'Título Z-A', value: 'title_desc' },
]

export const DEFAULT_WEBSITES_SORT_OPTION = WEBSITES_SORT_OPTIONS[0]

import { LuArrowUpDown } from 'react-icons/lu'
import { DropdownText } from '@/components/DropdownText/DropdownText'
import styles from './FeedSort.module.scss'
import {
  DEFAULT_WEBSITES_SORT_OPTION,
  WEBSITES_SORT_OPTIONS,
} from '@/constants/post'
import { useSort } from '@/pages/Feed/hooks/useSort'
import { useMemo } from 'react'

export function FeedSort() {
  const { selectedSort, updateSort, getSortById } = useSort()
  const sortLabel = useMemo(
    () =>
      getSortById(selectedSort)?.label || DEFAULT_WEBSITES_SORT_OPTION.label,
    [selectedSort, getSortById]
  )

  return (
    <DropdownText
      classNames={{
        content: styles.sortContent,
      }}
      valueLabel={sortLabel}
      options={WEBSITES_SORT_OPTIONS}
      onChange={updateSort}
      Icon={LuArrowUpDown}
      value={selectedSort}
      multiple={false}
    />
  )
}

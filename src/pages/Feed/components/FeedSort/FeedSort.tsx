import { TbArrowsSort } from 'react-icons/tb'
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
      classNames={{ text: styles.sort, panel: styles.sortPanel }}
      valueLabel={sortLabel}
      options={WEBSITES_SORT_OPTIONS}
      onChange={updateSort}
      Icon={TbArrowsSort}
      value={selectedSort}
      multiple={false}
    >
      Ordenar por:
    </DropdownText>
  )
}

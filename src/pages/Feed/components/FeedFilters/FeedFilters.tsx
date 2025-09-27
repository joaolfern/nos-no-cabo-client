import { DropdownButton } from '@/components/DropdownButton/DropdownButton'
import { useFilters } from '@/pages/Feed/hooks/useFilters'
import { useMemo } from 'react'
import styles from './FeedFilters.module.scss'
import { RadioGroup } from '@/components/RadioGroup/RadioGroup'
import type { DropdownButtonProps } from '@/components/DropdownButton/DropdownButtonInterfaces'
import { Typography } from '@/components/Typography/Typography'
import { MdTune } from 'react-icons/md'
import { Button } from '@/components/Button/Button'
import type { IFilterEvent } from '@/interfaces/IFilters'

type FeedFiltersProps = {
  onChange: (filter?: IFilterEvent) => void
}

export function FeedFilters() {}

FeedFilters.Inline = function FeedFiltersInline({
  onChange,
}: FeedFiltersProps) {
  return (
    <div className={styles.inline}>
      <KeywordFilter variant='inline' onChange={onChange} />
    </div>
  )
}

FeedFilters.Panel = function FeedFiltersPanel({ onChange }: FeedFiltersProps) {
  return (
    <div className={styles.panel}>
      <header className={styles.header}>
        <MdTune />
        <Typography variant='h3' asVariant={true}>
          Filtros
        </Typography>
      </header>
      <KeywordFilter variant='panel' />
      <Button className={styles.apply} onClick={() => onChange()}>
        Aplicar filtros
      </Button>
    </div>
  )
}

type FilterElementProps = {
  variant: 'panel' | 'inline'
}

function VariantFilter<T, M extends boolean | undefined>({
  variant,
  ...props
}: FilterElementProps & DropdownButtonProps<T, M>) {
  return variant === 'inline' ? (
    <DropdownButton {...props} />
  ) : (
    <RadioGroup {...props} />
  )
}

function KeywordFilter({
  variant,
  onChange,
}: FilterElementProps & Partial<FeedFiltersProps>) {
  const {
    keywordOptions,
    selectedKeywords,
    updateKeywords,
    getKeywordById,
    keywordIsLoading,
  } = useFilters()

  const labelOfSelected = useMemo(
    () => getLabelOfSelected(selectedKeywords, getKeywordById),
    [selectedKeywords, getKeywordById]
  )

  function handleChange(value: string) {
    const props = updateKeywords(value)

    if (onChange) {
      onChange(props)
    }
  }

  return (
    <VariantFilter
      variant={variant}
      label='Palavras-chave'
      labelOfSelected={labelOfSelected}
      onChange={handleChange}
      options={keywordOptions}
      value={selectedKeywords}
      multiple={true}
      loading={keywordIsLoading}
    />
  )
}

function getLabelOfSelected<T extends { name: string }>(
  selectedKeywords: string[],
  getKeywordById: (id: string) => T | undefined
) {
  return selectedKeywords.map((id) => getKeywordById(id)?.name).join(', ')
}

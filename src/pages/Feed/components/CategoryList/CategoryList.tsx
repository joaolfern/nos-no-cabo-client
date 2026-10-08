import type { ReactNode } from 'react'
import clsx from 'clsx'
import type { IconType } from 'react-icons'
import { LuEllipsis } from 'react-icons/lu'
import { Dropdown } from '@/components/Dropdown/Dropdown'
import { Typography } from '@/components/Typography/Typography'
import { ALL_CATEGORIES } from '@/pages/Feed/constants/categories'
import { splitVisibleCategories } from '@/pages/Feed/utils/splitVisibleCategories'
import { CategoryRowsSkeleton } from './CategoryRowsSkeleton'
import styles from './CategoryList.module.scss'

type CategoryOption = {
  label: string
  value: string
  Icon: IconType
}

type CategoryListProps = {
  options: CategoryOption[]
  counts: Map<string, number>
  total: number
  selected: string | null
  loading: boolean
  onSelect: (value: string | null) => void
  maxRows?: number
  search?: ReactNode
}

export function CategoryList({
  options,
  counts,
  total,
  selected,
  loading,
  onSelect,
  maxRows = Infinity,
  search,
}: CategoryListProps) {
  const { visible, hidden } = splitVisibleCategories(options, maxRows, selected)
  const countOf = (value: string) => counts.get(value) ?? 0

  return (
    <nav className={styles.list} aria-labelledby='feed-categories-title'>
      <div className={styles.header}>
        <span id='feed-categories-title' className={styles.title}>
          Categorias
        </span>
        {search}
      </div>
      {loading ? (
        <CategoryRowsSkeleton maxRows={maxRows} />
      ) : (
        <>
          <CategoryRow
            label='Todos'
            Icon={ALL_CATEGORIES.Icon}
            count={total}
            active={selected === null}
            onClick={() => onSelect(null)}
          />
          {visible.map((option) => (
            <CategoryRow
              key={option.value}
              label={option.label}
              Icon={option.Icon}
              count={countOf(option.value)}
              active={selected === option.value}
              onClick={() => onSelect(option.value)}
            />
          ))}
          {hidden.length > 0 && (
            <Dropdown
              position='right'
              classNames={{ trigger: styles.overflowTrigger }}
              options={hidden.map((option) => ({
                ...option,
                endContent: countOf(option.value),
              }))}
              value={selected ?? ''}
              onChange={onSelect}
            >
              <CategoryRow
                label='Mais categorias'
                Icon={LuEllipsis}
                count={hidden.length}
              />
            </Dropdown>
          )}
          {options.length === 0 && (
            <Typography variant='bodySm' color='muted' className={styles.empty}>
              Nenhuma categoria encontrada
            </Typography>
          )}
        </>
      )}
    </nav>
  )
}

type CategoryRowProps = {
  label: string
  Icon: IconType
  count: number
  active?: boolean
  onClick?: () => void
}

function CategoryRow({
  label,
  Icon,
  count,
  active = false,
  onClick,
}: CategoryRowProps) {
  return (
    <button
      type='button'
      className={clsx(styles.row, { [styles.active]: active })}
      aria-pressed={onClick ? active : undefined}
      onClick={onClick}
    >
      <Icon className={styles.icon} aria-hidden={true} />
      <span className={styles.label}>{label}</span>
      <span className={styles.count}>{count}</span>
    </button>
  )
}

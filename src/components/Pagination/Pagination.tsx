import clsx from 'clsx'
import { MdChevronLeft, MdChevronRight } from 'react-icons/md'
import { getPageItems } from './getPageItems'
import styles from './Pagination.module.scss'

type PaginationProps = {
  page: number
  pageCount: number
  onChange: (page: number) => void
  className?: string
}

export function Pagination({
  page,
  pageCount,
  onChange,
  className,
}: PaginationProps) {
  if (pageCount <= 1) return null

  return (
    <nav aria-label='Paginação' className={clsx(styles.nav, className)}>
      <ul className={styles.list}>
        <li>
          <button
            type='button'
            className={styles.control}
            aria-label='Página anterior'
            disabled={page <= 1}
            onClick={() => onChange(page - 1)}
          >
            <MdChevronLeft size={22} />
          </button>
        </li>
        {getPageItems(page, pageCount).map((item) =>
          typeof item === 'number' ? (
            <li key={item}>
              <button
                type='button'
                className={clsx(styles.page, {
                  [styles.current]: item === page,
                })}
                aria-label={`Página ${item}`}
                aria-current={item === page ? 'page' : undefined}
                onClick={() => onChange(item)}
              >
                {item}
              </button>
            </li>
          ) : (
            <li key={item} className={styles.ellipsis} aria-hidden='true'>
              …
            </li>
          )
        )}
        <li>
          <button
            type='button'
            className={styles.control}
            aria-label='Próxima página'
            disabled={page >= pageCount}
            onClick={() => onChange(page + 1)}
          >
            <MdChevronRight size={22} />
          </button>
        </li>
      </ul>
    </nav>
  )
}

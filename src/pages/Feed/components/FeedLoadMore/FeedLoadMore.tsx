import type { CSSProperties } from 'react'
import { LuChevronDown } from 'react-icons/lu'
import styles from './FeedLoadMore.module.scss'

type FeedLoadMoreProps = {
  shown: number
  total: number
  nextCount: number
  onLoadMore: () => void
}

export function FeedLoadMore({
  shown,
  total,
  nextCount,
  onLoadMore,
}: FeedLoadMoreProps) {
  const progress = {
    '--progress': `${(shown / total) * 100}%`,
  } as CSSProperties

  return (
    <div className={styles.loadMore}>
      <span className={styles.status}>
        Mostrando <strong>{shown}</strong> de <strong>{total}</strong>
      </span>
      <div
        className={styles.track}
        style={progress}
        role='progressbar'
        aria-label='Projetos exibidos'
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={shown}
      />
      <button type='button' className={styles.button} onClick={onLoadMore}>
        <LuChevronDown aria-hidden={true} />
        Carregar mais {nextCount}
      </button>
    </div>
  )
}

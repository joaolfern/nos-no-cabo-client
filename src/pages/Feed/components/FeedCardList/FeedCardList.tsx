import type { ReactNode } from 'react'
import type { IWebsite } from '@/interfaces/IWebsite'
import type { FeedView } from '@/interfaces/IFeedView'
import {
  FeedCard,
  type FeedCardVariant,
} from '@/pages/Feed/components/FeedCard/FeedCard'
import { FeedCardSkeleton } from '@/pages/Feed/components/FeedCard/FeedCardSkeleton'
import { FeedTable } from '@/pages/Feed/components/FeedTable/FeedTable'
import styles from './FeedCardList.module.scss'

type FeedCardListProps = {
  data: IWebsite[]
  isLoading: boolean
  skeletonCount: number
  view?: FeedView
  variant?: FeedCardVariant
  highlightKeywordId?: string
  emptyAction?: ReactNode
}

export function FeedCardList({
  data,
  isLoading,
  skeletonCount,
  view = 'grid',
  variant = 'detailed',
  highlightKeywordId,
  emptyAction,
}: FeedCardListProps) {
  if (!isLoading && data.length === 0) {
    return (
      <p className={styles.empty}>Nenhum projeto encontrado. {emptyAction}</p>
    )
  }

  if (view === 'list') {
    return (
      <FeedTable
        data={data}
        isLoading={isLoading}
        skeletonCount={skeletonCount}
        variant={variant}
        highlightKeywordId={highlightKeywordId}
      />
    )
  }

  return (
    <section className={styles.grid} aria-busy={isLoading}>
      {isLoading
        ? Array.from({ length: skeletonCount }, (_, index) => (
            <FeedCardSkeleton key={index} variant={variant} />
          ))
        : data.map((website) => (
            <FeedCard
              key={website.id}
              website={website}
              variant={variant}
              highlightKeywordId={highlightKeywordId}
            />
          ))}
    </section>
  )
}

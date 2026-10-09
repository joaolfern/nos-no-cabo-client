import type { ReactNode } from 'react'
import type { IWebsite } from '@/interfaces/IWebsite'
import type { FeedView } from '@/interfaces/IFeedView'
import {
  FeedCard,
  type FeedCardTone,
  type FeedCardVariant,
} from '@/pages/Feed/components/FeedCard/FeedCard'
import { FeedCardSkeleton } from '@/pages/Feed/components/FeedCard/FeedCardSkeleton'
import { FeedTable } from '@/pages/Feed/components/FeedTable/FeedTable'
import styles from './FeedCardList.module.scss'

export type FeedPendingItem = {
  website: IWebsite
  tone: FeedCardTone
  readOnly: boolean
  status: ReactNode
}

type FeedCardListProps = {
  data: IWebsite[]
  pending?: FeedPendingItem[]
  isLoading: boolean
  skeletonCount: number
  view?: FeedView
  variant?: FeedCardVariant
  highlightKeywordId?: string
  emptyAction?: ReactNode
}

export function FeedCardList({
  data,
  pending = [],
  isLoading,
  skeletonCount,
  view = 'grid',
  variant = 'detailed',
  highlightKeywordId,
  emptyAction,
}: FeedCardListProps) {
  if (!isLoading && data.length === 0 && pending.length === 0) {
    return (
      <p className={styles.empty}>Nenhum projeto encontrado. {emptyAction}</p>
    )
  }

  if (view === 'list') {
    return (
      <FeedTable
        data={data}
        pending={pending}
        isLoading={isLoading}
        skeletonCount={skeletonCount}
        variant={variant}
        highlightKeywordId={highlightKeywordId}
      />
    )
  }

  return (
    <section className={styles.grid} aria-busy={isLoading}>
      {pending.map(({ website, tone, readOnly, status }) => (
        <FeedCard
          key={website.id}
          website={website}
          variant={variant}
          readOnly={readOnly}
          tone={tone}
          aside={status}
        />
      ))}
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

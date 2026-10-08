import type { FeedView } from '@/interfaces/IFeedView'
import type { FeedCardVariant } from '@/pages/Feed/components/FeedCard/FeedCard'
import { FeedCardSkeleton } from '@/pages/Feed/components/FeedCard/FeedCardSkeleton'
import { FeedTableSkeleton } from '@/pages/Feed/components/FeedTable/FeedTableSkeleton'
import styles from './FeedCardList.module.scss'

type FeedCardListSkeletonProps = {
  count: number
  view: FeedView
  variant: FeedCardVariant
}

// What FeedCardList shows while loading, without the cards and table it renders once loaded.
export function FeedCardListSkeleton({
  count,
  view,
  variant,
}: FeedCardListSkeletonProps) {
  if (view === 'list') {
    return <FeedTableSkeleton count={count} variant={variant} />
  }

  return (
    <section className={styles.grid} aria-busy={true}>
      {Array.from({ length: count }, (_, index) => (
        <FeedCardSkeleton key={index} variant={variant} />
      ))}
    </section>
  )
}

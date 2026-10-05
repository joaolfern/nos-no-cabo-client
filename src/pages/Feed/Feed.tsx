import { FeedAside } from '@/pages/Feed/components/FeedAside/FeedAside'
import { usePageMeta } from '@/hooks/usePageMeta'
import { FeedCardList } from '@/pages/Feed/components/FeedCardList/FeedCardList'
import { FeedLoadMore } from '@/pages/Feed/components/FeedLoadMore/FeedLoadMore'
import { FeedTopbar } from '@/pages/Feed/components/FeedTopbar/FeedTopbar'
import { usePendingFeedItems } from '@/pages/SubmitWebsite/hooks/usePendingFeedItems'
import { useWebsites } from '@/pages/Feed/hooks/useWebsites'
import { useFilters } from '@/pages/Feed/hooks/useFilters'
import { useLocalStorageState } from '@/hooks/useLocalStorageState'
import { isFeedView } from '@/interfaces/IFeedView'
import styles from './Feed.module.scss'

export function Feed() {
  usePageMeta({ title: 'Projetos', path: '/websites' })
  const { websites, total, isLoading, hasMore, loadMore, pageSize } =
    useWebsites()
  const { selectedKeywords, clearKeywords, clearSearch } = useFilters()
  const pendingItems = usePendingFeedItems()
  const [view, setView] = useLocalStorageState('feed-view', 'grid', isFeedView)
  const remaining = (total ?? 0) - websites.length

  function clearFilters() {
    clearKeywords()
    clearSearch()
  }

  return (
    <div className={styles.container}>
      <FeedAside />
      <div className={styles.feed}>
        <FeedTopbar
          total={isLoading ? undefined : total}
          view={view}
          onViewChange={setView}
        />
        <FeedCardList
          isLoading={isLoading}
          skeletonCount={pageSize}
          data={websites}
          pending={pendingItems}
          view={view}
          highlightKeywordId={selectedKeywords[0]}
          emptyAction={
            <button
              type='button'
              className={styles.clearFilters}
              onClick={clearFilters}
            >
              Limpar filtros
            </button>
          }
        />
        {!isLoading && hasMore && total !== undefined && (
          <FeedLoadMore
            shown={websites.length}
            total={total}
            nextCount={Math.min(pageSize, remaining)}
            onLoadMore={loadMore}
          />
        )}
      </div>
    </div>
  )
}

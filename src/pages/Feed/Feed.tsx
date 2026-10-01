import { FeedAside } from '@/pages/Feed/components/FeedAside/FeedAside'
import { FeedCardList } from '@/pages/Feed/components/FeedCardList/FeedCardList'
import { FeedLoadMore } from '@/pages/Feed/components/FeedLoadMore/FeedLoadMore'
import { FeedTopbar } from '@/pages/Feed/components/FeedTopbar/FeedTopbar'
import { usePendingFeedItems } from '@/pages/SubmitWebsite/hooks/usePendingFeedItems'
import { useWebsites } from '@/pages/Feed/hooks/useWebsites'
import { useFilters } from '@/pages/Feed/hooks/useFilters'
import { useSort } from '@/pages/Feed/hooks/useSort'
import { useFeedPageSize } from '@/pages/Feed/hooks/useFeedPageSize'
import { useLocalStorageState } from '@/hooks/useLocalStorageState'
import { isFeedView } from '@/interfaces/IFeedView'
import { useMemo, useRef, useState } from 'react'
import styles from './Feed.module.scss'

export function Feed() {
  const { websites, isLoading } = useWebsites()
  const {
    filterBySearch,
    search,
    selectedKeywords,
    clearKeywords,
    clearSearch,
  } = useFilters()
  const { selectedSort } = useSort()
  const pendingItems = usePendingFeedItems()
  const [view, setView] = useLocalStorageState('feed-view', 'grid', isFeedView)

  const filteredWebsites = useMemo(
    () => filterBySearch(websites, search),
    [websites, search, filterBySearch]
  )

  // The loaded amount belongs to the filters it was loaded under. Whenever
  // search, keywords or sort change from what they were on the previous
  // render, the list goes back to its first batch — even a change that
  // round-trips back to a key seen before (e.g. clearing a filter).
  const listKey = `${search}|${selectedKeywords.join(',')}|${selectedSort}`
  const previousListKey = useRef(listKey)
  const pageSize = useFeedPageSize()
  const [loadedPages, setLoadedPages] = useState(1)
  const visibleCount = loadedPages * pageSize

  if (previousListKey.current !== listKey) {
    previousListKey.current = listKey
    if (loadedPages !== 1) setLoadedPages(1)
  }

  const visibleWebsites = useMemo(
    () => filteredWebsites.slice(0, visibleCount),
    [filteredWebsites, visibleCount]
  )
  const remaining = filteredWebsites.length - visibleWebsites.length

  function clearFilters() {
    clearKeywords()
    clearSearch()
  }

  return (
    <div className={styles.container}>
      <FeedAside />
      <div className={styles.feed}>
        <FeedTopbar
          total={isLoading ? undefined : filteredWebsites.length}
          view={view}
          onViewChange={setView}
        />
        <FeedCardList
          isLoading={isLoading}
          skeletonCount={pageSize}
          data={visibleWebsites}
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
        {!isLoading && remaining > 0 && (
          <FeedLoadMore
            shown={visibleWebsites.length}
            total={filteredWebsites.length}
            nextCount={Math.min(pageSize, remaining)}
            onLoadMore={() => setLoadedPages((pages) => pages + 1)}
          />
        )}
      </div>
    </div>
  )
}

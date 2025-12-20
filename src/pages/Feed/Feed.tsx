import { FeedAside } from '@/pages/Feed/components/FeedAside/FeedAside'
import { FeedCardList } from '@/pages/Feed/components/FeedCardList/FeedCardList'
import { FeedTopbar } from '@/pages/Feed/components/FeedTopbar/FeedTopbar'
import { useWebsites } from '@/pages/Feed/hooks/useWebsites'
import { useFilters } from '@/pages/Feed/hooks/useFilters'
import { useMemo } from 'react'
import styles from './Feed.module.scss'

export function Feed() {
  const { websites, isLoading } = useWebsites()
  const { filterBySearch, search } = useFilters()

  const filteredWebsites = useMemo(
    () => filterBySearch(websites, search),
    [websites, search, filterBySearch]
  )

  return (
    <div className={styles.container}>
      <FeedAside />
      <div className={styles.feed}>
        <FeedTopbar />
        <FeedCardList
          span={300}
          isLoading={isLoading}
          data={filteredWebsites}
        />
      </div>
    </div>
  )
}

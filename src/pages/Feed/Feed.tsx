import { FeedAside } from '@/pages/Feed/components/FeedAside/FeedAside'
import { FeedCardList } from '@/pages/Feed/components/FeedCardList/FeedCardList'
import { FeedTopbar } from '@/pages/Feed/components/FeedTopbar/FeedTopbar'
import styles from './Feed.module.scss'
import { useWebsites } from '@/pages/Feed/hooks/useWebsites'
import { NosNoCaboLayout } from '@/layouts/NosNoCaboLayout/NosNoCaboLayout'
import { useFilters } from '@/pages/Feed/hooks/useFilters'
import { useMemo } from 'react'

export function Feed() {
  const { websites, isLoading } = useWebsites()
  const { filterBySearch, search } = useFilters()

  const filteredWebsites = useMemo(
    () => filterBySearch(websites, search),
    [websites, search, filterBySearch]
  )

  return (
    <NosNoCaboLayout data-testid='feed'>
      <FeedAside />
      <div className={styles.feed}>
        <FeedTopbar />
        <FeedCardList isLoading={isLoading} data={filteredWebsites} />
      </div>
    </NosNoCaboLayout>
  )
}

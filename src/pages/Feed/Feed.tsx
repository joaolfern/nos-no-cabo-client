import { FeedAside } from '@/pages/Feed/components/FeedAside/FeedAside'
import { FeedCardList } from '@/pages/Feed/components/FeedCardList/FeedCardList'
import { FeedTopbar } from '@/pages/Feed/components/FeedTopbar/FeedTopbar'
import styles from './Feed.module.scss'
import { useWebsites } from '@/pages/Feed/hooks/useWebsites'
import { NosNoCaboLayout } from '@/layouts/NosNoCaboLayout/NosNoCaboLayout'
import { WebsiteForm } from '@/pages/WebsiteForm/WebsiteForm'

export function Feed() {
  const { websites } = useWebsites()

  return (
    <NosNoCaboLayout data-testid='feed'>
      <FeedAside />
      <div className={styles.feed}>
        <FeedTopbar />
        <FeedCardList data={websites} />
      </div>
      <WebsiteForm />
    </NosNoCaboLayout>
  )
}

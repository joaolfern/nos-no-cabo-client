import { Typography } from '@/components/Typography/Typography'
import styles from './LatestWebsites.module.scss'
import { FeedCardList } from '@/pages/Feed/components/FeedCardList/FeedCardList'
import { useWebsites } from '@/pages/Feed/hooks/useWebsites'
import type { IWebsite } from '@/interfaces/IWebsite'
import { useMemo } from 'react'

interface LatestWebsitesProps {
  websiteId: string
}

export function LatestWebsites({ websiteId }: LatestWebsitesProps) {
  const { websites: websitesRaw, isLoading } = useWebsites()
  const websites = useMemo(
    () => getLatestUniqueWebsites(websitesRaw, websiteId),
    [websitesRaw, websiteId]
  )

  return (
    <section className={styles.container}>
      <Typography variant='h3' asVariant={true}>
        Novos Sites
      </Typography>
      <FeedCardList span={400} isLoading={isLoading} data={websites} />
    </section>
  )
}

function getLatestUniqueWebsites(
  websitesRaw: IWebsite[],
  currentWebsiteId: string
): IWebsite[] {
  if (!websitesRaw) return []

  const result: IWebsite[] = []
  for (const website of websitesRaw) {
    if (website.id !== currentWebsiteId) {
      result.push(website)
      if (result.length === 3) break
    }
  }
  return result
}

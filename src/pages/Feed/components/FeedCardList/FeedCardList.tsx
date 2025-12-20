import { FeedCard } from '@/pages/Feed/components/FeedCard/FeedCard'
import styles from './FeedCardList.module.scss'
import type { IWebsite } from '@/interfaces/IWebsite'
import { FeedCardSkeleton } from '@/pages/Feed/components/FeedCard/FeedCardSkeleton'

type FeedCardListProps = React.HTMLAttributes<HTMLElement> & {
  data: IWebsite[]
  isLoading: boolean
  span: number
}

export function FeedCardList({
  data,
  isLoading,
  span = 300,
}: FeedCardListProps) {
  const style = { '--span': `${span}px` } as React.CSSProperties

  return (
    <section className={styles.list} style={style}>
      {isLoading ? (
        Array(3)
          .fill(null)
          .map((_, index) => <FeedCardSkeleton key={index} />)
      ) : data?.[0] !== undefined ? (
        data.map((website) => (
          <FeedCard
            key={website.id}
            id={website.id}
            createdAt={website.createdAt}
            updatedAt={website.updatedAt}
            keywords={website.keywords}
            name={website.name}
            color={website.color}
            description={website.description}
            faviconUrl={website.faviconUrl}
            url={website.url}
            author={website.author}
          />
        ))
      ) : (
        <p>Nenhum item encontrado</p>
      )}
    </section>
  )
}

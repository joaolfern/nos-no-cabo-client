import { FeedCard } from '@/pages/Feed/components/FeedCard/FeedCard'
import styles from './FeedCardList.module.scss'
import type { IWebsite } from '@/interfaces/IWebsite'
import { Loading } from '@/components/Loading/Loading'

type FeedCardListProps = React.HTMLAttributes<HTMLElement> & {
  data: IWebsite[]
  isLoading: boolean
}

export function FeedCardList({ data, isLoading }: FeedCardListProps) {
  return (
    <section className={styles.list}>
      {isLoading ? (
        <Loading />
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

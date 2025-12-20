import { Typography } from '@/components/Typography/Typography'
import { FeedCardList } from '@/pages/Feed/components/FeedCardList/FeedCardList'
import { useRecommendedBooks } from '@/hooks/useDataHooks'
import type { IKeyword, IWebsite } from '@/interfaces/IWebsite'
import { useMemo } from 'react'
import type { IBook } from '@/interfaces/IBook'
import { BOOK_COVER_QUALITY } from '@/config/env'
import styles from './RecommendBooks.module.scss'

type RecommendBooksProps = {
  keywords: IKeyword[]
}

export function RecommendBooks({ keywords }: RecommendBooksProps) {
  const { data, isLoading } = useRecommendedBooks(keywords)
  const formattedBooks = useMemo(
    () => (data?.works ? formatBooksToWebsites(data.works) : []),
    [data]
  )

  return (
    <section className={styles.container}>
      <Typography variant='h3' asVariant={true}>
        Leituras Recomendadas
      </Typography>
      <FeedCardList span={400} data={formattedBooks} isLoading={isLoading} />
    </section>
  )
}

function formatBooksToWebsites(books: IBook[]): IWebsite[] {
  return books.map(
    (book): IWebsite => ({
      id: '',
      name: book.title,
      description: book.subject?.join(', ') || '',
      url: book.key ? `https://openlibrary.org${book.key}` : '',
      color: undefined,
      keywords: (book.subject || []).map((s) => ({ name: s }) as IKeyword),
      createdAt: book.first_publish_year
        ? new Date(book.first_publish_year, 0, 1).toISOString()
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      faviconUrl: book.cover_id
        ? `https://covers.openlibrary.org/b/id/${book.cover_id}-${BOOK_COVER_QUALITY}.jpg`
        : '',
      author: book.authors[0]
        ? {
            id: book.authors[0].key,
            name: book.authors[0].name,
            profilePicture: '',
            createdAt: '',
            updatedAt: '',
            verified: false,
          }
        : {
            id: '',
            name: '',
            profilePicture: '',
            createdAt: '',
            updatedAt: '',
            verified: false,
          },
    })
  )
}

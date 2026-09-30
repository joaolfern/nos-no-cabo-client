import clsx from 'clsx'
import { LuArrowUpRight } from 'react-icons/lu'
import { Typography } from '@/components/Typography/Typography'
import { Image } from '@/components/Image/Image'
import {
  RECOMMENDED_BOOKS_LIMIT,
  useRecommendedBooks,
} from '@/hooks/useDataHooks'
import type { IKeyword } from '@/interfaces/IWebsite'
import type { IBook } from '@/interfaces/IBook'
import { BOOK_COVER_QUALITY } from '@/config/env'
import { getCategoryMeta } from '@/pages/Feed/constants/categories'
import styles from './RecommendBooks.module.scss'

type RecommendBooksProps = {
  keywords: IKeyword[]
}

// Measured across pages: usually one title wraps to two lines, the rest fit one.
const SKELETON_TITLE_LINES = Array.from(
  { length: RECOMMENDED_BOOKS_LIMIT },
  (_, index) => (index === RECOMMENDED_BOOKS_LIMIT - 1 ? 2 : 1)
)

export function RecommendBooks({ keywords }: RecommendBooksProps) {
  const primaryKeyword = keywords[0]
  const { data, isLoading } = useRecommendedBooks(
    primaryKeyword && getCategoryMeta(primaryKeyword.name).bookSubject
  )
  const books = data?.works ?? []

  if (!isLoading && books.length === 0) {
    return null
  }

  return (
    <section className={styles.container}>
      <Typography as='h2' variant='titleSm' className={styles.sectionTitle}>
        Leituras recomendadas
      </Typography>
      <div className={styles.list} aria-busy={isLoading}>
        {isLoading
          ? SKELETON_TITLE_LINES.map((titleLines, index) => (
              <BookRowSkeleton key={index} titleLines={titleLines} />
            ))
          : books.map((book) => <BookRow key={book.key} book={book} />)}
      </div>
    </section>
  )
}

function BookRowSkeleton({ titleLines }: { titleLines: number }) {
  return (
    <div className={clsx(styles.row, styles.skeletonRow)} aria-hidden={true}>
      <span className={clsx(styles.cover, styles.bone)} />
      <div className={styles.info}>
        <Typography variant='caption' className={styles.boneText}>
          &nbsp;
        </Typography>
        <Typography
          variant='bodyMd'
          className={clsx(styles.title, styles.boneText, styles.boneLong)}
        >
          &nbsp;
          {titleLines > 1 && (
            <>
              <br />
              &nbsp;
            </>
          )}
        </Typography>
        <Typography variant='caption' className={styles.boneText}>
          &nbsp;
        </Typography>
      </div>
    </div>
  )
}

function BookRow({ book }: { book: IBook }) {
  const author = book.authors[0]?.name
  const year = book.first_publish_year
  const keywords = book.subject?.slice(0, 3).join(', ')
  const coverUrl = book.cover_id
    ? `https://covers.openlibrary.org/b/id/${book.cover_id}-${BOOK_COVER_QUALITY}.jpg`
    : undefined

  return (
    <a
      className={styles.row}
      href={`https://openlibrary.org${book.key}`}
      target='_blank'
      rel='noopener noreferrer'
    >
      <Image className={styles.cover} src={coverUrl} alt={book.title} />
      <div className={styles.info}>
        {(author || year) && (
          <Typography variant='caption' color='muted'>
            {author}
            {author && year && <span className={styles.bullet}> • </span>}
            {year}
          </Typography>
        )}
        <Typography variant='bodyMd' lines={2} className={styles.title}>
          {book.title}
        </Typography>
        {keywords && (
          <Typography
            className={styles.keywords}
            variant='caption'
            color='muted'
            lines={1}
          >
            {keywords}
          </Typography>
        )}
      </div>
      <LuArrowUpRight className={styles.icon} size='1rem' />
    </a>
  )
}

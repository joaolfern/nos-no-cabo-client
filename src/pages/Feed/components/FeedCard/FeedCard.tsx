import { Typography } from '@/components/Typography/Typography'
import { WebsiteAuthorAndDate } from '@/pages/Blog/components/WebsiteAuthorAndDate/WebsiteAuthorAndDate'
import { WebsiteKeywords } from '@/pages/Blog/components/WebsiteKeywords/WebsiteKeywords'
import { CardImage } from '@/pages/Blog/components/CardImage/CardImage'
import styles from './FeedCard.module.scss'
import { Link } from '@/components/Link/Link'
import type { IWebsite } from '@/interfaces/IWebsite'
import clsx from 'clsx'
import { memo } from 'react'

type FeedCardProps = React.JSX.IntrinsicElements['section'] & IWebsite

const FeedCardInner = ({
  id,
  content,
  createdAt,
  color,
  keywords,
  updatedAt,
  className,
  author,
  description,
  faviconUrl,
  name,
  url,
  ...props
}: FeedCardProps) => {
  return (
    <article
      className={clsx(styles.container, className)}
      {...props}
      data-testid='feed-card'
    >
      <div className={styles.imageContainer}>
        <CardImage
          classNames={{ image: styles.image }}
          src={faviconUrl}
          alt={name}
        />
      </div>
      <div className={styles.content}>
        <WebsiteAuthorAndDate.Compact
          authorName={author.name}
          createdAt={createdAt}
        />
        <Typography variant='h3' asVariant={true} numberOfLines={2}>
          <Link className={styles.title} query={{ id }}>
            {name}
          </Link>
        </Typography>
        <Typography
          className={styles.description}
          variant='bodySmall'
          numberOfLines={2}
        >
          <p>{description}</p>
        </Typography>
        <WebsiteKeywords className={styles.keywords} keywords={keywords} />
      </div>
    </article>
  )
}

export const FeedCard = memo(FeedCardInner)

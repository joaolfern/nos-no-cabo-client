import { Typography } from '@/components/Typography/Typography'
import { WebsiteAuthorAndDate } from '@/pages/Webring/components/WebsiteAuthorAndDate/WebsiteAuthorAndDate'
import { WebsiteKeywords } from '@/pages/Webring/components/WebsiteKeywords/WebsiteKeywords'
import { CardImage } from '@/pages/Webring/components/CardImage/CardImage'
import styles from './FeedCard.module.scss'
import { Link } from '@/components/Link/Link'
import type { IWebsite } from '@/interfaces/IWebsite'
import clsx from 'clsx'
import { memo } from 'react'
import { VisitButton } from '@/pages/Webring/components/VisitButton/VisitButton'

type FeedCardProps = React.JSX.IntrinsicElements['section'] &
  IWebsite & {
    variant?: 'compact' | 'detailed'
  }

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
  style,
  variant = 'detailed',
  ...props
}: FeedCardProps) => {
  const completeStyle = {
    ...style,
    '--website-color': color,
  }

  return (
    <article
      className={clsx(styles.container, className, id && styles.clickable)}
      {...props}
      data-testid='feed-card'
      style={completeStyle}
    >
      <div>
        <CardImage
          classNames={{ image: styles.image }}
          src={faviconUrl}
          color={color}
          alt={name}
        />
      </div>
      <div className={styles.content}>
        {author && (
          <WebsiteAuthorAndDate.Compact
            authorName={author?.name}
            createdAt={createdAt}
          />
        )}
        {id && <Link className={styles.detailsLink} query={{ id }} />}
        <div className={styles.externalLinkContainer}>
          <Typography className={styles.title} variant='h3' numberOfLines={2}>
            <h3>{name}</h3>
          </Typography>
          <VisitButton url={url} />
        </div>
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

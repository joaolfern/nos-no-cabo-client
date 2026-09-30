import { memo } from 'react'
import clsx from 'clsx'
import { LuArrowUpRight, LuThumbsUp } from 'react-icons/lu'
import { Image } from '@/components/Image/Image'
import { Typography } from '@/components/Typography/Typography'
import { Tag } from '@/components/Tag/Tag'
import { Link } from '@/components/Link/Link'
import type { IWebsite } from '@/interfaces/IWebsite'
import { mockWebsiteLikes } from '@/pages/Website/utils/mockWebsiteMetrics/mockWebsiteMetrics'
import { getPrimaryKeyword } from '@/pages/Feed/utils/getPrimaryKeyword'
import { formatCompactNumber } from '@/utils/formatCompactNumber/formatCompactNumber'
import styles from './FeedCard.module.scss'
import { getCategoryLabel } from '@/pages/Feed/constants/categories'

export type FeedCardVariant = 'compact' | 'detailed'

type FeedCardProps = {
  website: IWebsite
  variant?: FeedCardVariant
  highlightKeywordId?: string
  readOnly?: boolean
}

function FeedCardInner({
  website,
  variant = 'detailed',
  highlightKeywordId,
  readOnly = false,
}: FeedCardProps) {
  const primaryKeyword = getPrimaryKeyword(website, highlightKeywordId)
  const otherKeywordsCount = website.keywords.length - 1

  return (
    <article
      className={clsx(styles.card, styles[variant])}
      data-testid='feed-card'
    >
      <Image
        className={styles.thumb}
        src={website.faviconUrl}
        alt={website.name}
      />
      <div className={styles.content}>
        <div className={styles.titleRow}>
          <Typography
            as='h3'
            variant='bodyMd'
            lines={1}
            className={styles.title}
          >
            {website.name}
          </Typography>
          <a
            className={styles.externalLink}
            href={website.url}
            target='_blank'
            rel='noopener noreferrer'
            aria-label={`Visitar ${website.name}`}
          >
            <LuArrowUpRight />
          </a>
        </div>
        <Typography
          as='p'
          variant='bodySm'
          color='muted'
          lines={2}
          className={styles.description}
        >
          {website.description}
        </Typography>
        <div className={styles.footer}>
          {primaryKeyword && (
            <Tag className={styles.tag}>
              {getCategoryLabel(primaryKeyword.name)}
            </Tag>
          )}
          {otherKeywordsCount > 0 && (
            <Tag className={styles.tag}>+{otherKeywordsCount}</Tag>
          )}
          {variant === 'detailed' && !readOnly && (
            <span className={styles.likes} title='Curtidas'>
              <LuThumbsUp aria-hidden={true} />
              {formatCompactNumber(mockWebsiteLikes(website.id))}
            </span>
          )}
        </div>
      </div>
      {!readOnly && (
        <Link
          className={styles.detailsLink}
          to={`/website/${website.id}`}
          aria-label={website.name}
        />
      )}
    </article>
  )
}

export const FeedCard = memo(FeedCardInner)

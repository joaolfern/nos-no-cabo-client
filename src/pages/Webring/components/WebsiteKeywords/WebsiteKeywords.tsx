import { Tag } from '@/components/Tag/Tag'
import styles from './WebsiteKeywords.module.scss'
import { clsx } from 'clsx'
import type { IKeyword } from '@/interfaces/IWebsite'
import { Typography } from '@/components/Typography/Typography'

type WebsiteKeywordsProps = React.HTMLAttributes<HTMLDivElement> & {
  keywords: IKeyword[]
}

export function WebsiteKeywords({
  className,
  keywords = [],
  ...props
}: WebsiteKeywordsProps) {
  const shownKeywords = keywords.slice(0, 2)
  const hasMore = Boolean(keywords[2])

  return (
    <div className={clsx(styles.container, className)} {...props}>
      {shownKeywords.map((keyword) => (
        <Tag key={keyword.id}>{keyword.name}</Tag>
      ))}
      {hasMore && (
        <Typography className={styles.more} variant='caption'>
          + {keywords.length - 2}
        </Typography>
      )}
    </div>
  )
}

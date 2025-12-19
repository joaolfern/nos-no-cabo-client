import { Tag } from '@/components/Tag/Tag'
import styles from './WebsiteKeywords.module.scss'
import { clsx } from 'clsx'
import type { IKeyword } from '@/interfaces/IWebsite'

type WebsiteKeywordsProps = React.HTMLAttributes<HTMLDivElement> & {
  keywords: IKeyword[]
}

export function WebsiteKeywords({
  className,
  keywords = [],
  ...props
}: WebsiteKeywordsProps) {
  const shownKeyword = keywords[0]
  const hasMore = keywords.slice(1)

  return (
    <div className={clsx(styles.container, className)} {...props}>
      {shownKeyword && <Tag key={shownKeyword.id}>{shownKeyword.name}</Tag>}
      {hasMore && <Tag>+ {keywords.length - 1}</Tag>}
    </div>
  )
}

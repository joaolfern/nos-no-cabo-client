import { Tag } from '@/components/Tag/Tag'
import styles from './WebsiteKeywords.module.scss'
import { clsx } from 'clsx'
import type { IKeyword } from '@/interfaces/IWebsite'

type WebsiteKeywordsProps = React.HTMLAttributes<HTMLDivElement> & {
  keywords: IKeyword[]
}

export function WebsiteKeywords({
  className,
  keywords,
  ...props
}: WebsiteKeywordsProps) {
  return (
    <div className={clsx(styles.container, className)} {...props}>
      {keywords.map((keyword) => (
        <Tag key={keyword.id}>{keyword.name}</Tag>
      ))}
    </div>
  )
}

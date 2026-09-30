import clsx from 'clsx'
import { LuArrowUpRight } from 'react-icons/lu'
import { Image } from '@/components/Image/Image'
import { Link } from '@/components/Link/Link'
import type { IWebsite } from '@/interfaces/IWebsite'
import type { FeedCardVariant } from '@/pages/Feed/components/FeedCard/FeedCard'
import { getPrimaryKeyword } from '@/pages/Feed/utils/getPrimaryKeyword'
import { mockWebsiteLikes } from '@/pages/Website/utils/mockWebsiteMetrics/mockWebsiteMetrics'
import { formatCompactNumber } from '@/utils/formatCompactNumber/formatCompactNumber'
import styles from './FeedTable.module.scss'
import { getCategoryLabel } from '@/pages/Feed/constants/categories'

type FeedTableProps = {
  data: IWebsite[]
  isLoading: boolean
  skeletonCount: number
  variant: FeedCardVariant
  highlightKeywordId?: string
}

export function FeedTable({
  data,
  isLoading,
  skeletonCount,
  variant,
  highlightKeywordId,
}: FeedTableProps) {
  const showLikes = variant === 'detailed'

  return (
    <div className={styles.container}>
      <table className={styles.table} aria-busy={isLoading}>
        <thead>
          <tr>
            <th className={styles.siteColumn}>Site</th>
            <th className={styles.optional}>Descrição</th>
            <th className={clsx(styles.categoryColumn, styles.optional)}>
              Categoria
            </th>
            {showLikes && <th className={styles.likesColumn}>Curtidas</th>}
            <th className={styles.visitColumn}>
              <span className={styles.srOnly}>Visitar</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {isLoading
            ? Array.from({ length: skeletonCount }, (_, index) => (
                <SkeletonRow key={index} showLikes={showLikes} />
              ))
            : data.map((website) => (
                <tr key={website.id} data-testid='feed-card'>
                  <td>
                    <Link className={styles.site} to={`/website/${website.id}`}>
                      <Image
                        className={styles.thumb}
                        src={website.faviconUrl}
                        alt=''
                      />
                      <span className={styles.name}>{website.name}</span>
                    </Link>
                  </td>
                  <td className={clsx(styles.description, styles.optional)}>
                    {website.description}
                  </td>
                  <td className={clsx(styles.category, styles.optional)}>
                    {getCategoryLabel(
                      getPrimaryKeyword(website, highlightKeywordId)?.name ?? ''
                    )}
                  </td>
                  {showLikes && (
                    <td className={styles.likes}>
                      {formatCompactNumber(mockWebsiteLikes(website.id))}
                    </td>
                  )}
                  <td className={styles.visit}>
                    <a
                      href={website.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      aria-label={`Visitar ${website.name}`}
                      title='Visitar'
                    >
                      <LuArrowUpRight />
                    </a>
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  )
}

function SkeletonRow({ showLikes }: { showLikes: boolean }) {
  return (
    <tr aria-hidden={true}>
      <td>
        <span className={styles.site}>
          <span className={clsx(styles.thumb, styles.bone)} />
          <span className={clsx(styles.boneText, styles.boneShort)}>
            &nbsp;
          </span>
        </span>
      </td>
      <td className={styles.optional}>
        <span className={styles.boneText}>&nbsp;</span>
      </td>
      <td className={styles.optional}>
        <span className={clsx(styles.boneText, styles.boneShort)}>&nbsp;</span>
      </td>
      {showLikes && <td />}
      <td />
    </tr>
  )
}

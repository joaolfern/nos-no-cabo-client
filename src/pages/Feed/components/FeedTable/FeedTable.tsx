import clsx from 'clsx'
import { useNavigate } from 'react-router'
import { LuArrowUpRight } from 'react-icons/lu'
import { Image } from '@/components/Image/Image'
import { Link } from '@/components/Link/Link'
import type { IWebsite } from '@/interfaces/IWebsite'
import type { FeedCardVariant } from '@/pages/Feed/components/FeedCard/FeedCard'
import type { FeedPendingItem } from '@/pages/Feed/components/FeedCardList/FeedCardList'
import { getPrimaryKeyword } from '@/pages/Feed/utils/getPrimaryKeyword'
import { visitUrl } from '@/utils/visitUrl/visitUrl'
import { formatCompactNumber } from '@/utils/formatCompactNumber/formatCompactNumber'
import { VerificationStatus } from '@/pages/WidgetEditor/components/VerificationStatus/VerificationStatus'
import styles from './FeedTable.module.scss'
import { getCategoryLabel } from '@/pages/Feed/constants/categories'

type FeedTableProps = {
  data: IWebsite[]
  pending: FeedPendingItem[]
  isLoading: boolean
  skeletonCount: number
  variant: FeedCardVariant
  highlightKeywordId?: string
}

export function FeedTable({
  data,
  pending,
  isLoading,
  skeletonCount,
  variant,
  highlightKeywordId,
}: FeedTableProps) {
  const showLikes = variant === 'detailed'
  const navigate = useNavigate()

  // The whole row opens the site; links and buttons inside it keep their own action.
  function openRow(event: React.MouseEvent, websiteId: string) {
    if ((event.target as HTMLElement).closest('a, button')) return
    navigate(`/website/${websiteId}`)
  }

  return (
    <div className={styles.container}>
      <table className={styles.table} aria-busy={isLoading}>
        <thead>
          <tr>
            <th className={styles.siteColumn}>Site</th>
            <th>Descrição</th>
            <th className={styles.categoryColumn}>Categoria</th>
            {showLikes && <th className={styles.likesColumn}>Curtidas</th>}
            <th className={styles.visitColumn}>
              <span className={styles.srOnly}>Visitar</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {pending.map(({ website, tone, status }) => (
            <tr
              key={website.id}
              className={clsx(styles.pendingRow, styles[tone])}
              data-testid='feed-card'
            >
              <td>
                <span className={styles.site}>
                  <Image
                    className={styles.thumb}
                    src={website.faviconUrl}
                    alt=''
                  />
                  <span className={styles.name}>{website.name}</span>
                </span>
              </td>
              <td className={styles.description}>{website.description}</td>
              <td className={styles.category}>
                {getCategoryLabel(website.keywords[0]?.name ?? '')}
              </td>
              <td className={styles.pendingStatus} colSpan={showLikes ? 2 : 1}>
                {status}
              </td>
            </tr>
          ))}
          {isLoading
            ? Array.from({ length: skeletonCount }, (_, index) => (
                <SkeletonRow key={index} showLikes={showLikes} />
              ))
            : data.map((website) => (
                <tr
                  key={website.id}
                  data-testid='feed-card'
                  className={styles.linkRow}
                  onClick={(event) => openRow(event, website.id)}
                >
                  <td>
                    <span className={styles.siteCell}>
                      <Link
                        className={styles.site}
                        to={`/website/${website.id}`}
                      >
                        <Image
                          className={styles.thumb}
                          src={website.faviconUrl}
                          alt=''
                        />
                        <span className={styles.name}>{website.name}</span>
                      </Link>
                      <VerificationStatus
                        websiteId={website.id}
                        websiteName={website.name}
                        verifiedAt={website.verifiedAt}
                      />
                    </span>
                  </td>
                  <td className={styles.description}>{website.description}</td>
                  <td className={styles.category}>
                    {getCategoryLabel(
                      getPrimaryKeyword(website, highlightKeywordId)?.name ?? ''
                    )}
                  </td>
                  {showLikes && (
                    <td className={styles.likes}>
                      {formatCompactNumber(website.likes ?? 0)}
                    </td>
                  )}
                  <td className={styles.visit}>
                    <a
                      href={visitUrl(website)}
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
      <td>
        <span className={styles.boneText}>&nbsp;</span>
      </td>
      <td>
        <span className={clsx(styles.boneText, styles.boneShort)}>&nbsp;</span>
      </td>
      {showLikes && <td />}
      <td />
    </tr>
  )
}

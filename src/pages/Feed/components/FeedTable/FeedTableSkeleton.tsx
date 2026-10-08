import clsx from 'clsx'
import type { FeedCardVariant } from '@/pages/Feed/components/FeedCard/FeedCard'
import styles from './FeedTable.module.scss'

export function FeedTableHead({ showLikes }: { showLikes: boolean }) {
  return (
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
  )
}

export function FeedTableSkeletonRow({ showLikes }: { showLikes: boolean }) {
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

type FeedTableSkeletonProps = {
  count: number
  variant: FeedCardVariant
}

export function FeedTableSkeleton({ count, variant }: FeedTableSkeletonProps) {
  const showLikes = variant === 'detailed'

  return (
    <div className={styles.container}>
      <table className={styles.table} aria-busy={true}>
        <FeedTableHead showLikes={showLikes} />
        <tbody>
          {Array.from({ length: count }, (_, index) => (
            <FeedTableSkeletonRow key={index} showLikes={showLikes} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

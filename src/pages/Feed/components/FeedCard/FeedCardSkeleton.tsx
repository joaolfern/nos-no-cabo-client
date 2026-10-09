import clsx from 'clsx'
import type { FeedCardVariant } from '@/pages/Feed/components/FeedCard/FeedCard'
import styles from './FeedCard.module.scss'

type FeedCardSkeletonProps = {
  variant: FeedCardVariant
  withTag?: boolean
}

export function FeedCardSkeleton({
  variant,
  withTag = true,
}: FeedCardSkeletonProps) {
  return (
    <article className={clsx(styles.card, styles[variant])} aria-hidden={true}>
      <span className={clsx(styles.thumb, styles.bone)} />
      <div className={styles.content}>
        <span className={clsx(styles.skeletonTitle, styles.boneText)}>
          &nbsp;
        </span>
        <span className={clsx(styles.skeletonDescription, styles.boneText)}>
          &nbsp;
          <br />
          &nbsp;
        </span>
        <div className={styles.footer}>
          {withTag && (
            <span className={clsx(styles.tag, styles.skeletonTag)}>&nbsp;</span>
          )}
        </div>
      </div>
    </article>
  )
}

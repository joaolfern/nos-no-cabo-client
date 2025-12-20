import clsx from 'clsx'
import styles from './FeedCard.module.scss'

type FeedCardSkeletonProps = React.JSX.IntrinsicElements['article']

export function FeedCardSkeleton({
  className,
  ...props
}: FeedCardSkeletonProps) {
  return (
    <article
      className={clsx(styles.container, styles.skeleton, className)}
      {...props}
    />
  )
}

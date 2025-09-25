import clsx from 'clsx'
import styles from './Tag.module.scss'
import { Typography } from '@/components/Typography/Typography'

type TagProps = React.HTMLAttributes<HTMLDivElement>

export function Tag({ className, ...props }: TagProps) {
  return (
    <Typography
      className={clsx(styles.tag, className)}
      variant='caption'
      {...props}
    />
  )
}

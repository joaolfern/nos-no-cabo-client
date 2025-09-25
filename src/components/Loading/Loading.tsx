import { MdHourglassBottom } from 'react-icons/md'
import styles from './Loading.module.scss'
import type { IconType } from 'react-icons'
import clsx from 'clsx'

type LoadingProps = Partial<IconType & React.SVGAttributes<SVGElement>>

export function Loading({ className, ...props }: LoadingProps) {
  return (
    <MdHourglassBottom className={clsx(styles.loading, className)} {...props} />
  )
}

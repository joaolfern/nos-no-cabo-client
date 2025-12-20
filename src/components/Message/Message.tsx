import type { MessageProps } from '@/components/Message/Message.types'
import clsx from 'clsx'
import styles from './Message.module.scss'
import { Typography } from '@/components/Typography/Typography'

export function Message({
  className,
  onDismiss,
  label,
  id,
  visible,
  action,
  ...props
}: MessageProps) {
  if (!visible) return null

  return (
    <div className={clsx(styles.message, className)} {...props}>
      <Typography variant='body'>{label}</Typography>
      {action && (
        <button className={styles.action} onClick={action.onPress}>
          {action.label}
        </button>
      )}
    </div>
  )
}

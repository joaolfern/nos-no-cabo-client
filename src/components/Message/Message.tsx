import type { MessageProps } from '@/components/Message/Message.types'
import type { MessageTone } from '@/interfaces/IMessage'
import clsx from 'clsx'
import { LuCircleAlert, LuCircleCheck, LuInfo, LuX } from 'react-icons/lu'
import { ButtonIcon } from '@/components/ButtonIcon/ButtonIcon'
import { Typography } from '@/components/Typography/Typography'
import styles from './Message.module.scss'

const TONE_ICONS: Record<MessageTone, typeof LuInfo> = {
  info: LuInfo,
  success: LuCircleCheck,
  error: LuCircleAlert,
}

export function Message({
  className,
  onDismiss,
  onLeft,
  label,
  id,
  tone,
  visible,
  action,
  ...props
}: MessageProps) {
  const Icon = TONE_ICONS[tone]

  function handleAnimationEnd() {
    if (!visible) onLeft?.()
  }

  return (
    <div
      className={clsx(
        styles.message,
        styles[tone],
        !visible && styles.leaving,
        className
      )}
      onAnimationEnd={handleAnimationEnd}
      {...props}
    >
      <Icon className={styles.icon} aria-hidden={true} />
      <Typography variant='bodyMd' className={styles.label}>
        {label}
      </Typography>
      {action && (
        <button
          type='button'
          className={styles.action}
          onClick={action.onPress}
        >
          {action.label}
        </button>
      )}
      {onDismiss && (
        <ButtonIcon
          type='button'
          variant='transparent'
          className={styles.dismiss}
          onClick={onDismiss}
          label='Fechar aviso'
        >
          <LuX aria-hidden={true} />
        </ButtonIcon>
      )}
    </div>
  )
}

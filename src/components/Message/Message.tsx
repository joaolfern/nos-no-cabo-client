import type { MessageProps } from '@/components/Message/Message.types'
import type { IMessageAction, MessageTone } from '@/interfaces/IMessage'
import clsx from 'clsx'
import { useState } from 'react'
import { LuCircleAlert, LuCircleCheck, LuInfo, LuX } from 'react-icons/lu'
import { ButtonIcon } from '@/components/ButtonIcon/ButtonIcon'
import { LoadingDots } from '@/components/LoadingDots/LoadingDots'
import { Typography } from '@/components/Typography/Typography'
import styles from './Message.module.scss'

const TONE_ICONS: Record<MessageTone, typeof LuInfo> = {
  info: LuInfo,
  success: LuCircleCheck,
  error: LuCircleAlert,
}

function MessageActionButton({ label, pendingLabel, onPress }: IMessageAction) {
  const [isPending, setIsPending] = useState(false)

  function handlePress() {
    if (pendingLabel) setIsPending(true)
    Promise.resolve(onPress()).catch(() => setIsPending(false))
  }

  return (
    <button
      type='button'
      className={styles.action}
      onClick={handlePress}
      disabled={isPending}
      aria-busy={isPending}
    >
      {isPending ? (
        <>
          {pendingLabel}
          <LoadingDots />
        </>
      ) : (
        label
      )}
    </button>
  )
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
      {action && <MessageActionButton {...action} />}
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

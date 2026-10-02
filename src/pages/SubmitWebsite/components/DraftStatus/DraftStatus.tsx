import { LuBell } from 'react-icons/lu'
import { Link } from '@/components/Link/Link'
import { LoadingDots } from '@/components/LoadingDots/LoadingDots'
import { useNotificationPermission } from '@/hooks/useNotificationPermission'
import {
  rejectionMessage,
  type IPendingSubmission,
} from '@/pages/SubmitWebsite/utils/pendingSubmissions'
import styles from './DraftStatus.module.scss'

type DraftStatusProps = {
  draft: IPendingSubmission
  onDismiss: () => void
}

export function DraftStatus({ draft, onDismiss }: DraftStatusProps) {
  const { permission, requestPermission } = useNotificationPermission()

  if (draft.status === 'rejected') {
    return (
      <span className={styles.status}>
        {rejectionMessage(draft.rejectionReason)}
        <Link
          className={styles.textButton}
          to={`/websites/novo?url=${encodeURIComponent(draft.url)}`}
          onClick={onDismiss}
        >
          Enviar de novo
        </Link>
        <button type='button' className={styles.textButton} onClick={onDismiss}>
          Dispensar
        </button>
      </span>
    )
  }

  return (
    <span className={styles.status}>
      Em análise
      <LoadingDots />
      {permission === 'default' && (
        <button
          type='button'
          className={styles.bell}
          onClick={requestPermission}
          aria-label='Avise-me quando meus sites forem publicados'
          title='Avise-me quando meus sites forem publicados'
        >
          <LuBell aria-hidden={true} />
        </button>
      )}
    </span>
  )
}

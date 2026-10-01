import { useState } from 'react'
import { LuBadgeCheck, LuBadgeHelp } from 'react-icons/lu'
import { UnverifiedModal } from './UnverifiedModal'
import styles from './VerificationStatus.module.scss'

type VerificationStatusProps = {
  websiteId: string
  websiteName: string
  verifiedAt: string | null | undefined
}

export function VerificationStatus({
  websiteId,
  websiteName,
  verifiedAt,
}: VerificationStatusProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (verifiedAt) {
    return (
      <span className={styles.verified} title='Verificado'>
        <LuBadgeCheck aria-label='Verificado' role='img' />
      </span>
    )
  }

  return (
    <>
      <button
        type='button'
        className={styles.unverified}
        title='Não verificado'
        aria-label='Não verificado: saiba mais'
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          setIsOpen(true)
        }}
      >
        <LuBadgeHelp aria-hidden />
      </button>
      <UnverifiedModal
        websiteId={websiteId}
        websiteName={websiteName}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}

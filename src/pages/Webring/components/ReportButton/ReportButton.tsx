import { clsx } from 'clsx'
import { useState } from 'react'
import { LuFlag } from 'react-icons/lu'
import { ReportDialog } from '@/pages/Webring/components/ReportDialog/ReportDialog'
import styles from './ReportButton.module.scss'

type ReportButtonProps = {
  id: string
  name: string
  className?: string
}

export function ReportButton({ id, name, className }: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        type='button'
        className={clsx(styles.reportButton, className)}
        onClick={() => setIsOpen(true)}
      >
        <LuFlag aria-hidden={true} />
        Notificar problema
      </button>
      {isOpen && (
        <ReportDialog
          websiteId={id}
          websiteName={name}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  )
}

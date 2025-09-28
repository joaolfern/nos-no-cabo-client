import { MdWarningAmber } from 'react-icons/md'
import styles from './ReportButton.module.scss'
import { clsx } from 'clsx'
import { isAdminMode } from '@/config/env'
import { useReportWebsite } from '@/hooks/useDataHooks'
import { handleNavigate } from '@/utils/handleNavigate/handleNavigate'
import { useState } from 'react'

type ReportButtonProps = React.JSX.IntrinsicElements['button'] & {
  id: string
}

export function ReportButton({
  children,
  className,
  id,
  ...props
}: ReportButtonProps) {
  const { mutate } = useReportWebsite()
  const [confirming, setConfirming] = useState(false)

  function onSuccess() {
    const url = new URL(window.location.href)

    handleNavigate(url, { id: null })
  }

  function handleClick() {
    if (confirming) {
      mutate(
        { id },
        {
          onSuccess,
        }
      )

      return
    }

    setConfirming(true)
  }

  return (
    <button
      className={clsx(styles.reportButton, className)}
      onClick={handleClick}
      {...props}
    >
      <MdWarningAmber />
      {confirming ? 'Confirmar' : isAdminMode ? 'Remover' : 'Denunciar'}
    </button>
  )
}

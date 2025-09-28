import { MdWarningAmber } from 'react-icons/md'
import styles from './ReportButton.module.scss'
import { clsx } from 'clsx'
import { isAdminMode } from '@/config/env'
import { useReportWebsite } from '@/hooks/useDataHooks'
import { handleNavigate } from '@/utils/handleNavigate/handleNavigate'

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

  function onSuccess() {
    const url = new URL(window.location.href)

    handleNavigate(url, { id: null })
  }

  function handleClick() {
    mutate(
      { id },
      {
        onSuccess,
      }
    )
  }

  return (
    <button
      className={clsx(styles.reportButton, className)}
      onClick={handleClick}
      {...props}
    >
      <MdWarningAmber />
      {isAdminMode ? 'Remover' : 'Denunciar'}
    </button>
  )
}

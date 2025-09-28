import { MdWarningAmber } from 'react-icons/md'
import styles from './ReportButton.module.scss'
import { clsx } from 'clsx'
import { isAdminMode } from '@/config/env'
import { useReportWebsite } from '@/hooks/useDataHooks'

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
  return (
    <button
      className={clsx(styles.reportButton, className)}
      onClick={() => mutate({ id })}
      {...props}
    >
      <MdWarningAmber />
      {isAdminMode ? 'Remover' : 'Denunciar'}
    </button>
  )
}

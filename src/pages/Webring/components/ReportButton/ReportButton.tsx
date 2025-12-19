import { MdWarningAmber } from 'react-icons/md'
import styles from './ReportButton.module.scss'
import { clsx } from 'clsx'
import { isAdminMode } from '@/config/env'
import { useReportWebsite } from '@/hooks/useDataHooks'
import { Dialog } from '@/components/Dialog/Dialog'
import { useState } from 'react'
import { Typography } from '@/components/Typography/Typography'
import { useNavigate } from 'react-router'

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
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const navigate = useNavigate()

  function onSuccess() {
    navigate('/websites')
  }

  function handleClick() {
    setIsDialogOpen(true)
  }

  function handleReport() {
    mutate(
      { id },
      {
        onSuccess,
      }
    )
  }

  function handleCloseDialog() {
    setIsDialogOpen(false)
  }

  const textContent = isAdminMode ? TEXT_CONTENT.admin : TEXT_CONTENT.default

  return (
    <>
      <button
        className={clsx(styles.reportButton, className)}
        onClick={handleClick}
        {...props}
      >
        <MdWarningAmber />
        {textContent.button}
      </button>
      <Dialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        title={textContent.title}
        onCancel={handleCloseDialog}
        onConfirm={handleReport}
      >
        <Typography variant='body'>{textContent.message}</Typography>
      </Dialog>
    </>
  )
}

const TEXT_CONTENT = {
  admin: {
    title: 'Remover website',
    message: 'Tem certeza que deseja remover este website?',
    button: 'Remover',
  },
  default: {
    title: 'Denunciar website',
    message: 'Tem certeza que deseja denunciar este website?',
    button: 'Denunciar',
  },
}

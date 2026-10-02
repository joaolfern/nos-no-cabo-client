import { clsx } from 'clsx'
import { LuFlag } from 'react-icons/lu'
import { TERMS_CONTACT_EMAIL } from '@/pages/Terms/utils/terms'
import styles from './ReportButton.module.scss'

type ReportButtonProps = {
  id: string
  name: string
  className?: string
}

// Until community reports exist on the server, a report is an e-mail to the maintainer.
export function ReportButton({ id, name, className }: ReportButtonProps) {
  const subject = `Problema com ${name}`
  const body = `Site: ${name}\nPágina: ${window.location.origin}/website/${id}\n\nO que está errado:\n`
  const href = `mailto:${TERMS_CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

  return (
    <a className={clsx(styles.reportButton, className)} href={href}>
      <LuFlag aria-hidden={true} />
      Notificar problema
    </a>
  )
}

import clsx from 'clsx'
import { Link } from '@/components/Link/Link'
import { TERMS_CONTACT_EMAIL } from '@/pages/Terms/utils/terms'
import styles from './SiteFooter.module.scss'

export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer className={clsx(styles.footer, className)}>
      <div className={styles.row}>
        <span>Nós no Cabo</span>
        <span aria-hidden>·</span>
        <Link to='/termos'>Termos de uso</Link>
        <span aria-hidden>·</span>
        <a href={`mailto:${TERMS_CONTACT_EMAIL}`}>Contato</a>
      </div>
    </footer>
  )
}

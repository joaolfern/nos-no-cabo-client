import { Button } from '@/components/Button/Button'
import { MdArrowBack } from 'react-icons/md'
import styles from './InnerRouteAside.module.scss'
import { Link } from '@/components/Link/Link'

export function InnerRouteAside() {
  return (
    <aside>
      <Button
        asChild={true}
        className={styles.backButton}
        variant='secondary'
        small={true}
      >
        <Link to='/websites'>
          <MdArrowBack className={styles.backIcon} size='1.25rem' />
          Voltar
        </Link>
      </Button>
    </aside>
  )
}

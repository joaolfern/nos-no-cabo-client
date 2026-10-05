import { Loading } from '@/components/Loading/Loading'
import styles from './WebsiteLoader.module.scss'

export function WebsiteLoader() {
  return (
    <div className={styles.loading} role='status' aria-label='Carregando site'>
      <Loading aria-hidden={true} />
    </div>
  )
}

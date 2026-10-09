import { LuCircleCheck } from 'react-icons/lu'
import styles from './PublishedStatus.module.scss'

export function PublishedStatus() {
  return (
    <span className={styles.status}>
      <LuCircleCheck aria-hidden={true} />
      Publicado
    </span>
  )
}

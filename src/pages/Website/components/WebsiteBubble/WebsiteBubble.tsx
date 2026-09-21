import styles from './WebsiteBubble.module.scss'
import type { WebsiteBubbleProps } from './WebsiteBubble.types'

export type WebsiteBubbleExtendedProps = WebsiteBubbleProps & {
  isStationed?: boolean
}

export function WebsiteBubble({
  imageSrc,
  title,
  url,
  isStationed,
}: WebsiteBubbleExtendedProps) {
  return (
    <a
      href={url}
      className={`${styles.container} ${isStationed ? styles.stationed : ''}`}
    >
      <img src={imageSrc} alt={title} className={styles.image} />
      <span>{title}</span>
    </a>
  )
}

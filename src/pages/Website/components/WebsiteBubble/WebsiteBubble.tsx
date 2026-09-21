import styles from './WebsiteBubble.module.scss'
import type { WebsiteBubbleProps } from './WebsiteBubble.types'

export type WebsiteBubbleExtendedProps = WebsiteBubbleProps & {
  isStationed?: boolean
}

export function WebsiteBubble({
  id: _id,
  imageSrc,
  title,
  url,
  isStationed,
}: WebsiteBubbleExtendedProps) {
  const containerClasses = [
    styles.container,
    isStationed ? styles.stationed : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <a draggable={false} href={url} className={containerClasses}>
      <img
        draggable={false}
        src={imageSrc}
        alt={title}
        className={styles.image}
        onError={(e) => {
          e.currentTarget.style.filter = 'grayscale(100%)'
          e.currentTarget.style.opacity = '0.5'
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      />
      <span className={styles.title}>{title}</span>
    </a>
  )
}

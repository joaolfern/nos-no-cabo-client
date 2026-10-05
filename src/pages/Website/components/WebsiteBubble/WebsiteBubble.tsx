import styles from './WebsiteBubble.module.scss'
import {
  BUBBLE_FALLBACK_IMAGE,
  type WebsiteBubbleProps,
} from './WebsiteBubble.types'

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
        onError={(event) => {
          const image = event.currentTarget
          if (!image.src.endsWith(BUBBLE_FALLBACK_IMAGE)) {
            image.src = BUBBLE_FALLBACK_IMAGE
          }
        }}
      />
      <span className={styles.title}>{title}</span>
    </a>
  )
}

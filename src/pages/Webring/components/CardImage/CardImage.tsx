import { Image } from '@/components/Image/Image'
import type { ImageProps } from '@/components/Image/ImageInterfaces'
import clsx from 'clsx'
import styles from './CardImage.module.scss'

type WebsiteProps = Omit<ImageProps, 'className'> & {
  classNames?: {
    container?: string
    image?: string
  }
  color: string | undefined
}

export function CardImage({ classNames, color, src, ...props }: WebsiteProps) {
  return (
    <div className={clsx(styles.container, classNames?.container)}>
      <Image
        className={clsx(styles.image, classNames?.image)}
        style={{ backgroundColor: src ? color : undefined }}
        src={src}
        {...props}
      />
    </div>
  )
}

import type { ImageProps } from '@/components/Image/ImageInterfaces'
import clsx from 'clsx'
import { useCallback, useEffect, useState } from 'react'
import styles from './Image.module.scss'

export function Image({
  fallback = '/images/imageFallback.svg',
  src,
  avatar,
  className,
  style,
  ...props
}: ImageProps) {
  const [imgSrc, setImgSrc] = useState(src ?? fallback)

  const handleError = useCallback(() => {
    setImgSrc((prev) => (prev !== fallback ? fallback : prev))
  }, [fallback])

  useEffect(() => {
    if (src) {
      setImgSrc(src)

      return
    }

    handleError()
  }, [src, handleError])

  const completeStyle = {
    ...style,
    objectFit: !src ? 'cover' : style?.objectFit,
  }

  return (
    <img
      className={clsx({ [styles.avatar]: avatar }, className)}
      style={completeStyle}
      loading='lazy'
      src={imgSrc}
      onError={handleError}
      {...props}
    />
  )
}

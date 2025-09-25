import type { ImageProps } from '@/components/Image/ImageInterfaces'
import clsx from 'clsx'
import { useCallback, useEffect, useState } from 'react'
import styles from './Image.module.scss'

export function Image({
  fallback = '/images/imageFallback.svg',
  src,
  avatar,
  className,
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

  return (
    <img
      className={clsx({ [styles.avatar]: avatar }, className)}
      loading='lazy'
      src={imgSrc}
      onError={handleError}
      {...props}
    />
  )
}

import type { ImageProps } from '@/components/Image/ImageInterfaces'
import clsx from 'clsx'
import { useCallback, useEffect, useState } from 'react'
import FallbackSvg from '@/assets/imageFallback.svg?react'
import styles from './Image.module.scss'

export function Image({
  fallback,
  src,
  avatar,
  className,
  style,
  ...props
}: ImageProps) {
  const [imgSrc, setImgSrc] = useState(src ?? fallback)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setImgSrc(src)
  }, [src])

  const handleError = useCallback(() => {
    setHasError(true)
    if (fallback) setImgSrc(fallback)
  }, [fallback])

  const completeStyle = {
    ...style,
    objectFit: !src ? 'cover' : style?.objectFit,
  }

  if (!imgSrc || hasError) {
    return (
      <FallbackSvg className={clsx({ [styles.avatar]: avatar }, className)} />
    )
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

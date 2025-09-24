import { getIsMobile } from '@/utils/getIsMobile/getIsMobile'
import { useState, useEffect, useTransition } from 'react'

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && getIsMobile(window.innerWidth)
  )

  const [, startTransition] = useTransition()

  useEffect(() => {
    function handleResize() {
      startTransition(() => {
        setIsMobile(getIsMobile(window.innerWidth))
      })
    }

    if (typeof window !== 'undefined') {
      handleResize()
      window.addEventListener('resize', handleResize)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [])

  return isMobile
}

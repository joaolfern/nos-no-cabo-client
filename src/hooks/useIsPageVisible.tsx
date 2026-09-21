import { useState, useEffect, useRef } from 'react'

const useIsPageVisible = () => {
  const [isVisible, setIsVisible] = useState(!document.hidden)
  const isVisibleRef = useRef(!document.hidden)

  useEffect(() => {
    const handleVisibilityChange = () => {
      const currentState = !document.hidden
      setIsVisible(currentState)
      isVisibleRef.current = currentState
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return { isVisible, isVisibleRef }
}

export default useIsPageVisible

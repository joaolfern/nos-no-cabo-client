import { useEffect } from 'react'

interface UseEscapeProps {
  isOpen: boolean
  onClose?: () => void
}

export function useEscape({ isOpen, onClose }: UseEscapeProps) {
  useEffect(() => {
    if (!isOpen) return
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose?.()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])
}

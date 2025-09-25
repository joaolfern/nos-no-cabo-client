import { useIsMobile } from '@/hooks/useIsMobile'
import { useEffect } from 'react'

type UseDismissOnScrollProps = {
  onDismiss: () => void
  isOpen: boolean
  panelRef: React.RefObject<HTMLDivElement | null>
}

export function useDismissOnScroll({
  onDismiss,
  isOpen,
  panelRef,
}: UseDismissOnScrollProps) {
  const isMobile = useIsMobile()

  useEffect(() => {
    if (!isMobile || !isOpen) return

    function handleScroll(event: Event) {
      const isPanelScroll =
        panelRef.current &&
        (event.target === panelRef.current ||
          panelRef.current.contains(event.target as Node))

      if (isPanelScroll) {
        return
      }

      onDismiss()
    }

    window.addEventListener('scroll', handleScroll, true)

    return () => {
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [isMobile, onDismiss, isOpen, panelRef])
}

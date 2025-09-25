import { useEffect } from 'react'

type UseClickOutsideProps = {
  triggerRef: React.RefObject<HTMLDivElement | null>
  panelRef: React.RefObject<HTMLDivElement | null>
  onDismiss: () => void
  isOpen: boolean
}

export function useClickOutside({
  triggerRef,
  panelRef,
  onDismiss,
  isOpen,
}: UseClickOutsideProps) {
  useEffect(() => {
    const containsTarget = (target: Node, element: HTMLElement | null) =>
      element && element.contains(target)

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const isClickOutside =
        !containsTarget(target, triggerRef.current) &&
        !containsTarget(target, panelRef.current)

      if (isClickOutside) {
        onDismiss()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onDismiss, panelRef, triggerRef])
}

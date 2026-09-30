import {
  useCallback,
  useLayoutEffect,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react'
import type { DropdownPosition } from '@/components/Dropdown/DropdownInterfaces'

const GAP = 6
const VIEWPORT_MARGIN = 8
// Not visibility: hidden, which would block focusing an option before placement.
const UNPLACED: CSSProperties = { opacity: 0 }

type UseAnchoredPositionProps = {
  triggerRef: RefObject<HTMLElement | null>
  panelRef: RefObject<HTMLElement | null>
  isOpen: boolean
  position: DropdownPosition
}

export function useAnchoredPosition({
  triggerRef,
  panelRef,
  isOpen,
  position,
}: UseAnchoredPositionProps) {
  const [style, setStyle] = useState<CSSProperties>(UNPLACED)

  const update = useCallback(() => {
    const trigger = triggerRef.current
    const panel = panelRef.current
    if (!trigger || !panel) return

    const anchor = trigger.getBoundingClientRect()
    const panelRect = panel.getBoundingClientRect()
    const width = Math.max(panelRect.width, anchor.width)
    const viewportWidth = document.documentElement.clientWidth
    const viewportHeight = window.innerHeight

    const below = anchor.bottom + GAP
    const above = anchor.top - GAP - panelRect.height
    const fitsBelow =
      below + panelRect.height <= viewportHeight - VIEWPORT_MARGIN
    const top = fitsBelow || above < VIEWPORT_MARGIN ? below : above

    const preferredLeft =
      position === 'right' ? anchor.left : anchor.right - width
    const left = Math.min(
      Math.max(preferredLeft, VIEWPORT_MARGIN),
      viewportWidth - VIEWPORT_MARGIN - width
    )

    setStyle({ top, left, minWidth: anchor.width })
  }, [triggerRef, panelRef, position])

  useLayoutEffect(() => {
    if (!isOpen) {
      setStyle(UNPLACED)
      return
    }

    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)

    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [isOpen, update])

  return style
}

import type { RefObject } from 'react'
import type { BubbleInstance } from '../../LandingPage.types'
import { useIsMobile } from '@/hooks/useIsMobile'
import { DesktopConnectionLine } from './DesktopConnectionLine'
import { MobileConnectionLine } from './MobileConnectionLine'

export function ConnectionLine(props: {
  activeBubbles: BubbleInstance[]
  bubbleRefs: RefObject<Map<string, HTMLDivElement>>
  containerRef: RefObject<HTMLDivElement | null>
}) {
  const isMobile = useIsMobile()

  return isMobile ? (
    <MobileConnectionLine {...props} />
  ) : (
    <DesktopConnectionLine {...props} />
  )
}

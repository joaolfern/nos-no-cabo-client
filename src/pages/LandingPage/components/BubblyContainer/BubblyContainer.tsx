import { useState, useRef, useEffect } from 'react'
import type { WebsiteBubbleProps } from '@/pages/Website/components/WebsiteBubble/WebsiteBubble.types'
import styles from './BubblyContainer.module.scss'
import { getLaneCount } from '../../utils/getNextBubble'
import type { BubbleInstance } from '../../LandingPage.types'
import { BubblyItem } from '../BubblyItem/BubblyItem'
import { ConnectionLine } from '../ConnectionLine/ConnectionLine'
import { getIsMobile } from '@/utils/getIsMobile/getIsMobile'

const PANEL_BLACKLIST_WIDTH_PX = 400
const PANEL_BLACKLIST_HEIGHT_PX = 230
const PANEL_BLACKLIST_TOP_PERCENT = 25
const MOBILE_TOP_BLACKLIST_PERCENT = 100 / 3
const MOBILE_BOTTOM_BLACKLIST_PERCENT = 20
const LANE_PADDING_PX = 10
const MIN_TOP_PERCENT = 10
const MAX_TOP_PERCENT = 82
const TOP_RETRY_ATTEMPTS = 24

const shuffleArray = <T,>(array: T[]): T[] => {
  const cloned = [...array]
  for (let i = cloned.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[cloned[i], cloned[j]] = [cloned[j], cloned[i]]
  }
  return cloned
}

export function BubblyContainer({ items }: { items: WebsiteBubbleProps[] }) {
  const [laneCount, setLaneCount] = useState(() => getLaneCount())
  const [activeBubbles] = useState<BubbleInstance[]>(() =>
    getActiveItems(items, laneCount)
  )

  const containerRef = useRef<HTMLDivElement>(null)
  const bubbleRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  useEffect(() => {
    const handleResize = () => {
      setLaneCount(getLaneCount())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className={styles.bubblyContainer} ref={containerRef}>
      <ConnectionLine
        activeBubbles={activeBubbles}
        bubbleRefs={bubbleRefs}
        containerRef={containerRef}
      />
      {activeBubbles.map((bubble) => (
        <BubblyItem
          key={bubble.uniqueId}
          id={bubble.item.id}
          imageSrc={bubble.item.imageSrc}
          title={bubble.item.title}
          url={bubble.item.url}
          trajectoryConfig={bubble.config}
          laneCount={laneCount}
          onWrapperRefChange={(element) => {
            if (element) {
              bubbleRefs.current.set(bubble.uniqueId, element)
              return
            }
            bubbleRefs.current.delete(bubble.uniqueId)
          }}
        />
      ))}
    </div>
  )
}

function getWiggleConfig() {
  const wiggleDuration = 1.1 + Math.random() * 1.4
  const wiggleOffset = 7 + Math.random() * 13
  const wiggleOffsetY = 4 + Math.random() * 10
  const floatDepth = 0.8 + Math.random() * 0.6
  const floatPhase = Math.random() * 1.2

  return {
    wiggleDuration,
    wiggleOffset,
    wiggleOffsetY,
    floatDepth,
    floatPhase,
  }
}

type Rect = {
  left: number
  right: number
  top: number
  bottom: number
}

function getCenteredPanelBlacklistRect(
  viewportWidth: number,
  viewportHeight: number
): Rect {
  const left = viewportWidth / 2 - PANEL_BLACKLIST_WIDTH_PX / 2
  const top = (PANEL_BLACKLIST_TOP_PERCENT / 100) * viewportHeight

  return {
    left,
    right: left + PANEL_BLACKLIST_WIDTH_PX,
    top,
    bottom: top + PANEL_BLACKLIST_HEIGHT_PX,
  }
}

function getBlacklistRects(
  viewportWidth: number,
  viewportHeight: number
): Rect[] {
  const isMobileViewport = getIsMobile(viewportWidth)

  if (isMobileViewport) {
    const topCutoff = (MOBILE_TOP_BLACKLIST_PERCENT / 100) * viewportHeight
    const bottomStart =
      ((100 - MOBILE_BOTTOM_BLACKLIST_PERCENT) / 100) * viewportHeight

    return [
      {
        left: 0,
        right: viewportWidth,
        top: 0,
        bottom: topCutoff,
      },
      {
        left: 0,
        right: viewportWidth,
        top: bottomStart,
        bottom: viewportHeight,
      },
    ]
  }

  return [getCenteredPanelBlacklistRect(viewportWidth, viewportHeight)]
}

function getLaneLeftPx(
  lane: number,
  laneCount: number,
  viewportWidth: number,
  size: number
) {
  const usableWidth = Math.max(0, viewportWidth - LANE_PADDING_PX * 2)
  const laneWidth = laneCount > 0 ? usableWidth / laneCount : usableWidth
  const centeredLeft =
    LANE_PADDING_PX + laneWidth * lane + (laneWidth - size) / 2

  return Math.min(
    viewportWidth - LANE_PADDING_PX - size,
    Math.max(LANE_PADDING_PX, centeredLeft)
  )
}

function intersectsBlacklist(
  lane: number,
  laneCount: number,
  topPercent: number,
  size: number,
  viewportWidth: number,
  viewportHeight: number,
  blacklistRects: Rect[]
) {
  const left = getLaneLeftPx(lane, laneCount, viewportWidth, size)
  const right = left + size
  const top = (topPercent / 100) * viewportHeight
  const bottom = top + size

  return blacklistRects.some((blacklistRect) => {
    const horizontalOverlap =
      left < blacklistRect.right && right > blacklistRect.left
    const verticalOverlap =
      top < blacklistRect.bottom && bottom > blacklistRect.top

    return horizontalOverlap && verticalOverlap
  })
}

function getRandomTopPercent() {
  return MIN_TOP_PERCENT + Math.random() * (MAX_TOP_PERCENT - MIN_TOP_PERCENT)
}

function getActiveItems(items: WebsiteBubbleProps[], laneCount: number) {
  const BASE_SIZE = 34
  const viewportWidth =
    typeof window === 'undefined' ? 1366 : Math.max(1, window.innerWidth)
  const viewportHeight =
    typeof window === 'undefined' ? 768 : Math.max(1, window.innerHeight)
  const blacklistRects = getBlacklistRects(viewportWidth, viewportHeight)
  const isMobileViewport = getIsMobile(viewportWidth)
  const shuffled = shuffleArray(items).slice(0, laneCount)
  const bubbles: BubbleInstance[] = shuffled.map((item, i) => {
    const size = BASE_SIZE
    let top = getRandomTopPercent()
    let attempts = 0

    while (
      intersectsBlacklist(
        i,
        laneCount,
        top,
        size,
        viewportWidth,
        viewportHeight,
        blacklistRects
      ) &&
      attempts < TOP_RETRY_ATTEMPTS
    ) {
      top = getRandomTopPercent()
      attempts++
    }

    if (
      intersectsBlacklist(
        i,
        laneCount,
        top,
        size,
        viewportWidth,
        viewportHeight,
        blacklistRects
      )
    ) {
      if (isMobileViewport) {
        const sizePercent = (size / viewportHeight) * 100
        const minSafeTop = Math.max(
          MIN_TOP_PERCENT,
          MOBILE_TOP_BLACKLIST_PERCENT + 2
        )
        const maxSafeTop = Math.min(
          MAX_TOP_PERCENT,
          100 - MOBILE_BOTTOM_BLACKLIST_PERCENT - sizePercent - 2
        )

        if (minSafeTop <= maxSafeTop) {
          top = minSafeTop + Math.random() * (maxSafeTop - minSafeTop)
        }
      } else {
        const panelRect = blacklistRects[0]
        const belowPanelPercent = (panelRect.bottom / viewportHeight) * 100 + 2
        const abovePanelPercent = (panelRect.top / viewportHeight) * 100 - 2

        if (belowPanelPercent <= MAX_TOP_PERCENT) {
          top = belowPanelPercent
        } else if (abovePanelPercent >= MIN_TOP_PERCENT) {
          top = abovePanelPercent
        }
      }
    }

    return {
      uniqueId: `${item.id}-${Date.now()}-${i}`,
      item,
      config: {
        lane: i,
        size,
        top,
        ...getWiggleConfig(),
      },
    }
  })

  return bubbles
}

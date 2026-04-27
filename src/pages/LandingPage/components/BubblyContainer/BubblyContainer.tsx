import { memo, useState, useEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'
import { WebsiteBubble } from '@/pages/Website/components/WebsiteBubble/WebsiteBubble'
import type { WebsiteBubbleProps } from '@/pages/Website/components/WebsiteBubble/WebsiteBubble.types'
import styles from './BubblyContainer.module.scss'

type BubbleTrajectoryConfig = {
  lane: number
  speed: number
  size: number
  wiggleDuration: number
  wiggleOffset: number
}

type BubbleInstance = {
  uniqueId: string
  item: WebsiteBubbleProps
  config: BubbleTrajectoryConfig
}

type BubblyItemProps = WebsiteBubbleProps & {
  trajectoryConfig: BubbleTrajectoryConfig
  uniqueId: string
  onComplete: (id: string) => void
  onStation: (lane: number) => void
  exitStation: (lane: number) => void
}

const LANE_COUNT = 12
const MIN_SPEED_SECONDS = 15
const MAX_SPEED_SECONDS = 25
const BASE_SIZE_PX = 45
const VARIANCE_SIZE_PX = 35
const LANE_COOLDOWN_MS = 5000

const shuffleArray = <T,>(array: T[]): T[] => {
  const cloned = [...array]
  for (let i = cloned.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[cloned[i], cloned[j]] = [cloned[j], cloned[i]]
  }
  return cloned
}

const getCenterWeightedLane = () => {
  const u = (Math.random() + Math.random() + Math.random()) / 3
  return Math.floor(u * LANE_COUNT)
}

const BubblyItem = memo(function BubblyItemInner({
  id,
  imageSrc,
  title,
  url,
  trajectoryConfig,
  uniqueId,
  onComplete,
  onStation,
  exitStation,
}: BubblyItemProps) {
  const [isStationed, setIsStationed] = useState(false)
  const leaveEffectTimer = useRef<ReturnType<typeof setTimeout>>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const wigglerRef = useRef<HTMLDivElement>(null)
  const floatTweenRef = useRef<gsap.core.Tween | null>(null)
  const wiggleTweenRef = useRef<gsap.core.Tween | null>(null)
  const isStationedRef = useRef(false)
  const onCompleteRef = useRef(onComplete)
  const uniqueIdRef = useRef(uniqueId)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    uniqueIdRef.current = uniqueId
  }, [uniqueId])

  useEffect(() => {
    const wrapper = wrapperRef.current
    const wiggler = wigglerRef.current
    if (!wrapper || !wiggler) return

    const totalDistance = window.innerHeight + 150
    const { speed, wiggleDuration, wiggleOffset } = trajectoryConfig

    gsap.set(wrapper, { opacity: 0, y: 0 })

    floatTweenRef.current = gsap.to(wrapper, {
      y: -totalDistance,
      duration: speed,
      ease: 'none',
      onComplete: () => {
        if (!isStationedRef.current) onCompleteRef.current(uniqueIdRef.current)
      },
      onUpdate: function () {
        const progress = this.progress()
        if (progress < 0.1) {
          gsap.set(wrapper, { opacity: progress * 10 })
        } else if (progress > 0.9) {
          gsap.set(wrapper, { opacity: (1 - progress) * 10 })
        } else {
          gsap.set(wrapper, { opacity: 1 })
        }
      },
    })

    wiggleTweenRef.current = gsap.to(wiggler, {
      x: wiggleOffset,
      duration: wiggleDuration,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    })

    return () => {
      floatTweenRef.current?.kill()
      wiggleTweenRef.current?.kill()
    }
  }, [])

  useEffect(() => {
    isStationedRef.current = isStationed
    if (isStationed) {
      floatTweenRef.current?.pause()
      wiggleTweenRef.current?.pause()
    } else {
      floatTweenRef.current?.resume()
      wiggleTweenRef.current?.resume()
    }
  }, [isStationed])

  const handleMouseEnter = useCallback(() => {
    if (leaveEffectTimer.current) {
      clearTimeout(leaveEffectTimer.current)
    }

    if (!isStationed) {
      setIsStationed(true)
      onStation(trajectoryConfig.lane)
    }
  }, [isStationed, onStation, trajectoryConfig.lane])

  const handleMouseLeave = useCallback(() => {
    leaveEffectTimer.current = setTimeout(() => {
      if (isStationedRef.current) {
        setIsStationed(false)
        exitStation(trajectoryConfig.lane)
      }
    }, 500)
  }, [exitStation, trajectoryConfig.lane])

  const wrapperStyle = {
    '--lane': trajectoryConfig.lane,
    '--lane-count': LANE_COUNT,
    '--size': `${trajectoryConfig.size}px`,
  } as React.CSSProperties

  return (
    <div
      ref={wrapperRef}
      className={`${styles.bubblyItemWrapper} ${isStationed ? styles.stationedWrapper : ''}`}
      style={wrapperStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div ref={wigglerRef} className={styles.bubblyItemWiggler}>
        <WebsiteBubble
          id={id}
          imageSrc={imageSrc}
          title={title}
          url={url}
          isStationed={isStationed}
        />
      </div>
    </div>
  )
})

export function BubblyContainer({ items }: { items: WebsiteBubbleProps[] }) {
  const [activeBubbles, setActiveBubbles] = useState<BubbleInstance[]>([])
  const itemsQueue = useRef<WebsiteBubbleProps[]>([])
  const laneLastUsed = useRef<number[]>(new Array(LANE_COUNT).fill(0))
  const stationedLanes = useRef<Set<number>>(new Set())

  const handleStation = useCallback((lane: number) => {
    stationedLanes.current.add(lane)
  }, [])

  const exitStation = useCallback((lane: number) => {
    stationedLanes.current.delete(lane)
  }, [])

  useEffect(() => {
    if (!items.length) return

    let timeoutId: NodeJS.Timeout

    const releaseNextBubble = () => {
      if (stationedLanes.current.size >= LANE_COUNT) {
        timeoutId = setTimeout(releaseNextBubble, 3000)
        return
      }

      if (itemsQueue.current.length === 0) {
        itemsQueue.current = shuffleArray(items)
      }

      const nextItem = itemsQueue.current.shift()!
      const now = Date.now()
      let candidateLane = getCenterWeightedLane()
      let attempts = 0

      while (
        (now - laneLastUsed.current[candidateLane] < LANE_COOLDOWN_MS ||
          stationedLanes.current.has(candidateLane)) &&
        attempts < 20
      ) {
        candidateLane = Math.floor(Math.random() * LANE_COUNT)
        attempts++
      }

      if (stationedLanes.current.has(candidateLane)) {
        const availableLanes = Array.from({ length: LANE_COUNT })
          .map((_, i) => i)
          .filter((lane) => !stationedLanes.current.has(lane))

        if (availableLanes.length > 0) {
          candidateLane = availableLanes[0]
        }
      }

      laneLastUsed.current[candidateLane] = now

      const speed =
        MIN_SPEED_SECONDS +
        Math.random() * (MAX_SPEED_SECONDS - MIN_SPEED_SECONDS)
      const size = BASE_SIZE_PX + Math.random() * VARIANCE_SIZE_PX
      const wiggleDuration = 2 + Math.random() * 3
      const wiggleOffset = 5 + Math.random() * 15

      const newBubble: BubbleInstance = {
        uniqueId: `${nextItem.id}-${now}-${Math.random()}`,
        item: nextItem,
        config: {
          lane: candidateLane,
          speed,
          size,
          wiggleDuration,
          wiggleOffset,
        },
      }

      setActiveBubbles((prev) => [...prev, newBubble])

      const nextDelay = 3000 + (Math.random() * 2000 - 1000)
      timeoutId = setTimeout(releaseNextBubble, nextDelay)
    }

    releaseNextBubble()

    return () => clearTimeout(timeoutId)
  }, [items])

  const handleAnimationEnd = useCallback((uniqueId: string) => {
    setActiveBubbles((prev) => prev.filter((b) => b.uniqueId !== uniqueId))
  }, [])

  return (
    <div className={styles.bubblyContainer}>
      {activeBubbles.map((bubble) => (
        <BubblyItem
          key={bubble.uniqueId}
          uniqueId={bubble.uniqueId}
          id={bubble.item.id}
          imageSrc={bubble.item.imageSrc}
          title={bubble.item.title}
          url={bubble.item.url}
          trajectoryConfig={bubble.config}
          onComplete={handleAnimationEnd}
          onStation={handleStation}
          exitStation={exitStation}
        />
      ))}
    </div>
  )
}

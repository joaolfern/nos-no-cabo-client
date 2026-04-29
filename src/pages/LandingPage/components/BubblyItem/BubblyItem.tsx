import { memo, useState, useEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import Draggable from 'gsap/Draggable'
import { WebsiteBubble } from '@/pages/Website/components/WebsiteBubble/WebsiteBubble'
import type { WebsiteBubbleProps } from '@/pages/Website/components/WebsiteBubble/WebsiteBubble.types'
import { useIsMobile } from '@/hooks/useIsMobile'
import type { BubbleTrajectoryConfig } from '../../LandingPage.types'
import styles from './BubblyItem.module.scss'

gsap.registerPlugin(useGSAP, Draggable)

type BubblyItemProps = WebsiteBubbleProps & {
  trajectoryConfig: BubbleTrajectoryConfig
  laneCount: number
  onWrapperRefChange?: (element: HTMLDivElement | null) => void
}

const BubbleItemsCache = new Map()

export const BubblyItem = memo(function BubblyItemInner({
  id,
  imageSrc,
  title,
  url,
  trajectoryConfig,
  laneCount,
  onWrapperRefChange,
}: BubblyItemProps) {
  const isMobile = useIsMobile()

  const [status, setStatus] = useState<'idle' | 'stationed'>('idle')

  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const tiltRef = useRef<HTMLDivElement | null>(null)
  const statusRef = useRef(status)
  const leaveTimerRef = useRef<gsap.core.Tween | null>(null)
  const enterTimerRef = useRef<gsap.core.Tween | null>(null)
  const basePositionRef = useRef({ x: 0, y: 0 })
  const tiltRectRef = useRef<DOMRect | null>(null)
  const rotateXToRef = useRef<((value: number) => void) | null>(null)
  const rotateYToRef = useRef<((value: number) => void) | null>(null)

  useEffect(() => {
    statusRef.current = status
  }, [status])

  const handleEnterRef = useRef<(() => void) | null>(null)
  const handleLeaveRef = useRef<(() => void) | null>(null)

  useGSAP(
    (_, contextSafe) => {
      const floatEl = wrapperRef.current
      const tiltEl = tiltRef.current
      if (!floatEl || !tiltEl) return

      gsap.from(floatEl, {
        opacity: 0,
        duration: 0.6,
        ease: 'back.out(1.7)',
        delay: Math.random() * 0.5,
      })

      gsap.from(tiltEl, {
        scale: 0.96,
        duration: 0.6,
        ease: 'back.out(1.7)',
        delay: Math.random() * 0.5,
      })

      // Restore persisted position from previous mount
      const savedPos = BubbleItemsCache.get(`${id}-position`) || { x: 0, y: 0 }
      basePositionRef.current = savedPos

      const depth = trajectoryConfig.floatDepth
      const swayAmplitude = trajectoryConfig.wiggleOffset * depth
      const driftAmplitude = trajectoryConfig.wiggleOffsetY * depth
      const bobAmplitude = Math.max(1.2, trajectoryConfig.wiggleOffsetY * 0.55)
      const phase = trajectoryConfig.floatPhase

      const idSeed = Array.from(String(id)).reduce(
        (acc, char) => acc + char.charCodeAt(0),
        0
      )
      const seedA = ((idSeed % 17) + 3) / 10
      const seedB = ((idSeed % 23) + 5) / 10
      const seedC = ((idSeed % 29) + 7) / 10
      const phaseState = {
        t: phase * Math.PI * 2,
      }
      const baseCycleSeconds = Math.max(
        5.6,
        trajectoryConfig.wiggleDuration * 4.2
      )
      const angularVelocity = (Math.PI * 2) / baseCycleSeconds

      const setX = gsap.quickSetter(floatEl, 'x', 'px')
      const setY = gsap.quickSetter(floatEl, 'y', 'px')

      rotateXToRef.current = gsap.quickTo(tiltEl, 'rotateX', {
        duration: 0.2,
        ease: 'power1.out',
      })
      rotateYToRef.current = gsap.quickTo(tiltEl, 'rotateY', {
        duration: 0.2,
        ease: 'power1.out',
      })
      gsap.set(tiltEl, { transformPerspective: 500 })

      const getWaveOffsets = (t: number) => {
        const slowWaveX = Math.sin(t * (0.55 + seedA * 0.08)) * swayAmplitude
        const fastWaveX =
          Math.sin(t * (1.05 + seedB * 0.08) + phase * 0.9) *
          (swayAmplitude * 0.12)
        const slowWaveY =
          Math.cos(t * (0.42 + seedB * 0.07) + phase * 0.5) * driftAmplitude
        const bobWaveY =
          Math.sin(t * (0.82 + seedC * 0.07) + phase * 1.1) * bobAmplitude

        return {
          x: slowWaveX + fastWaveX,
          y: slowWaveY + bobWaveY,
        }
      }

      const applyFloat = () => {
        if (statusRef.current === 'stationed') return

        const waveOffsets = getWaveOffsets(phaseState.t)
        const x = basePositionRef.current.x + waveOffsets.x
        const y = basePositionRef.current.y + waveOffsets.y

        setX(x)
        setY(y)
      }

      const tickFloat = () => {
        const deltaSeconds = gsap.ticker.deltaRatio(60) / 60
        phaseState.t += angularVelocity * deltaSeconds
        applyFloat()
      }

      applyFloat()
      gsap.ticker.add(tickFloat)

      if (contextSafe) {
        handleEnterRef.current = contextSafe(() => {
          leaveTimerRef.current?.kill()
          if (statusRef.current === 'idle') {
            enterTimerRef.current = gsap.delayedCall(0.01, () =>
              setStatus('stationed')
            )
          }
        })
      }

      if (contextSafe) {
        handleLeaveRef.current = contextSafe(() => {
          enterTimerRef.current?.kill()
          leaveTimerRef.current = gsap.delayedCall(0.15, () => {
            const renderedX = Number(gsap.getProperty(floatEl, 'x')) || 0
            const renderedY = Number(gsap.getProperty(floatEl, 'y')) || 0
            const waveOffsets = getWaveOffsets(phaseState.t)

            // Rebase so resumed float starts from current rendered position.
            basePositionRef.current = {
              x: renderedX - waveOffsets.x,
              y: renderedY - waveOffsets.y,
            }

            setStatus('idle')
          })
        })
      }

      return () => {
        leaveTimerRef.current?.kill()
        enterTimerRef.current?.kill()
        gsap.ticker.remove(tickFloat)
      }
    },
    { scope: wrapperRef }
  )

  const handleEnter = useCallback(() => handleEnterRef.current?.(), [])
  const handleLeave = useCallback(() => handleLeaveRef.current?.(), [])

  const setWrapperRef = useCallback(
    (element: HTMLDivElement | null) => {
      wrapperRef.current = element
      onWrapperRefChange?.(element)
    },
    [onWrapperRefChange]
  )

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = wrapperRef.current
    if (!el) return
    const rect = tiltRectRef.current || el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -10
    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 10
    rotateXToRef.current?.(rotateX)
    rotateYToRef.current?.(rotateY)
  }, [])

  const resetTilt = useCallback(() => {
    gsap.to(tiltRef.current, {
      duration: 0.3,
      rotateX: 0,
      rotateY: 0,
      ease: 'power1.inOut',
    })
  }, [])

  const handlePointerEnter = useCallback(() => {
    const el = wrapperRef.current
    if (el) {
      tiltRectRef.current = el.getBoundingClientRect()
    }
    handleEnter()
  }, [handleEnter])

  const handlePointerLeave = useCallback(() => {
    tiltRectRef.current = null
    resetTilt()
    handleLeave()
  }, [handleLeave, resetTilt])

  function handleFocus() {
    if (isMobile) return
    handleEnter()
  }

  function handleBlur() {
    if (isMobile) return
    handleLeave()
  }

  const cssVariables = {
    '--lane': trajectoryConfig.lane,
    '--lane-count': laneCount,
    '--lane-padding': '10px',
    '--size': `${trajectoryConfig.size}px`,
    '--top': `${trajectoryConfig.top}%`,
  } as React.CSSProperties

  return (
    <div
      ref={setWrapperRef}
      className={`
        ${styles.bubblyItemWrapper}
        ${status === 'stationed' ? styles.stationedWrapper : ''}
      `}
      style={cssVariables}
      onMouseMove={handleMouseMove}
      onMouseEnter={handlePointerEnter}
      onMouseLeave={handlePointerLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      tabIndex={1}
    >
      <div ref={tiltRef} className={styles.tiltLayer}>
        <WebsiteBubble
          id={id}
          imageSrc={imageSrc}
          title={title}
          url={url}
          isStationed={status === 'stationed'}
        />
      </div>
    </div>
  )
})

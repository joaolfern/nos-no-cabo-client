import { useEffect, useRef, type RefObject } from 'react'
import gsap from 'gsap'
import type { BubbleInstance } from '../../LandingPage.types'
import styles from './ConnectionLine.module.scss'
import { useIsMobile } from '@/hooks/useIsMobile'

const INTERACTION_RADIUS_PX = 50
const IDLE_TAKEOVER_DELAY_MS = 3000
const IDLE_PATH_SPEED_PX = 70

const getControlPoint = (
  current: { x: number; y: number },
  previous: { x: number; y: number },
  next: { x: number; y: number },
  reverse?: boolean
) => {
  const p = previous || current
  const n = next || current
  const angle = Math.atan2(n.y - p.y, n.x - p.x)
  const l = Math.sqrt(Math.pow(n.x - p.x, 2) + Math.pow(n.y - p.y, 2)) * 0.2
  const x = current.x + Math.cos(angle + (reverse ? Math.PI : 0)) * l
  const y = current.y + Math.sin(angle + (reverse ? Math.PI : 0)) * l
  return { x, y }
}

export function ConnectionLine({
  activeBubbles,
  bubbleRefs,
  containerRef,
}: {
  activeBubbles: BubbleInstance[]
  bubbleRefs: RefObject<Map<string, HTMLDivElement>>
  containerRef: RefObject<HTMLDivElement | null>
}) {
  const isMobile = useIsMobile()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mousePos = useRef({ x: -1000, y: -1000 })
  const userMousePos = useRef<{ x: number; y: number } | null>(null)
  const isHoveringInteractiveArea = useRef(false)
  const lastInteractiveTs = useRef(0)
  const wasUsingUserTarget = useRef(false)
  const idleState = useRef({
    x: 0,
    y: 0,
    initialized: false,
    segmentIndex: 0,
    segmentProgress: 0,
  })
  const lastFrameTs = useRef<number | null>(null)
  const cachedContainerRect = useRef<DOMRect | null>(null)

  const simulatedY = useRef<number | null>(null)

  const activeBubblesRef = useRef(activeBubbles)

  useEffect(() => {
    activeBubblesRef.current = activeBubbles
  }, [activeBubbles])

  useEffect(() => {
    const updateContainerRect = () => {
      if (containerRef.current) {
        cachedContainerRect.current =
          containerRef.current.getBoundingClientRect()
      }
    }

    updateContainerRect()
    window.addEventListener('resize', updateContainerRect)
    window.addEventListener('scroll', updateContainerRect)

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (cachedContainerRect.current && !isMobile) {
        userMousePos.current = {
          x: e.clientX - cachedContainerRect.current.left,
          y: e.clientY - cachedContainerRect.current.top,
        }

        const targetNode = e.target instanceof Node ? e.target : null
        const isOverLine =
          !!targetNode &&
          !!canvasRef.current &&
          canvasRef.current.contains(targetNode)

        let isOverBubble = false
        if (targetNode && bubbleRefs.current) {
          for (const bubbleEl of bubbleRefs.current.values()) {
            if (bubbleEl.contains(targetNode)) {
              isOverBubble = true
              break
            }
          }
        }

        isHoveringInteractiveArea.current = isOverLine || isOverBubble
        if (isHoveringInteractiveArea.current) {
          lastInteractiveTs.current = performance.now()
        }
      }
    }

    window.addEventListener('mousemove', handleGlobalMouseMove)

    return () => {
      window.removeEventListener('resize', updateContainerRect)
      window.removeEventListener('scroll', updateContainerRect)
      window.removeEventListener('mousemove', handleGlobalMouseMove)
    }
  }, [bubbleRefs, containerRef, isMobile])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true })
    if (!ctx) return

    const resizeCanvas = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const dpr = window.devicePixelRatio || 1
        canvas.width = rect.width * dpr
        canvas.height = rect.height * dpr
        ctx.scale(dpr, dpr)
        canvas.style.width = `${rect.width}px`
        canvas.style.height = `${rect.height}px`
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const drawFrame = () => {
      if (!cachedContainerRect.current || !bubbleRefs.current || !canvas) {
        return
      }

      const now = performance.now()
      const deltaSeconds =
        lastFrameTs.current === null
          ? 1 / 60
          : (now - lastFrameTs.current) / 1000
      lastFrameTs.current = now

      const width = cachedContainerRect.current.width
      const height = cachedContainerRect.current.height

      ctx.clearRect(0, 0, width, height)

      const points: { x: number; y: number }[] = []

      activeBubblesRef.current.forEach((bubble) => {
        const el = bubbleRefs.current!.get(bubble.uniqueId)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.width > 0 && rect.height > 0) {
            points.push({
              x: rect.left - cachedContainerRect.current!.left + rect.width / 2,
              y: rect.top - cachedContainerRect.current!.top + rect.height / 2,
            })
          }
        }
      })

      if (points.length > 1) {
        if (isMobile) {
          if (points.length > 3) {
            if (simulatedY.current === null) {
              simulatedY.current = height + 100
            }

            simulatedY.current -= 3

            if (simulatedY.current < -100) {
              simulatedY.current = height + 100
            }

            let closestPoint = points[0]
            let minDiff = Infinity

            for (const p of points) {
              const diff = Math.abs(p.y - simulatedY.current)
              if (diff < minDiff) {
                minDiff = diff
                closestPoint = p
              }
            }

            if (closestPoint) {
              if (mousePos.current.x < -500) {
                mousePos.current.x = closestPoint.x
              }
              mousePos.current.x += (closestPoint.x - mousePos.current.x) * 0.1
              mousePos.current.y = simulatedY.current
            }
          } else {
            mousePos.current = { x: -1000, y: -1000 }
          }
        } else {
          const orderedPoints = [...points].sort((a, b) => a.x - b.x)

          if (!idleState.current.initialized) {
            idleState.current.initialized = true
            idleState.current.segmentIndex = 0
            idleState.current.segmentProgress = 0
            idleState.current.x = orderedPoints[0].x
            idleState.current.y = orderedPoints[0].y
          }

          if (!isHoveringInteractiveArea.current && orderedPoints.length > 1) {
            let remainingDistance = IDLE_PATH_SPEED_PX * deltaSeconds

            while (remainingDistance > 0) {
              const start =
                orderedPoints[
                  idleState.current.segmentIndex % orderedPoints.length
                ]
              const end =
                orderedPoints[
                  (idleState.current.segmentIndex + 1) % orderedPoints.length
                ]

              const dx = end.x - start.x
              const dy = end.y - start.y
              const segmentLength = Math.sqrt(dx * dx + dy * dy)

              if (segmentLength < 0.001) {
                idleState.current.segmentIndex =
                  (idleState.current.segmentIndex + 1) % orderedPoints.length
                idleState.current.segmentProgress = 0
                continue
              }

              const traveledDistance =
                idleState.current.segmentProgress * segmentLength
              const distanceToEnd = segmentLength - traveledDistance

              if (remainingDistance >= distanceToEnd) {
                idleState.current.segmentIndex =
                  (idleState.current.segmentIndex + 1) % orderedPoints.length
                idleState.current.segmentProgress = 0
                remainingDistance -= distanceToEnd
              } else {
                const nextDistance = traveledDistance + remainingDistance
                idleState.current.segmentProgress = nextDistance / segmentLength
                remainingDistance = 0
              }
            }
          }

          if (orderedPoints.length > 1) {
            const start =
              orderedPoints[
                idleState.current.segmentIndex % orderedPoints.length
              ]
            const end =
              orderedPoints[
                (idleState.current.segmentIndex + 1) % orderedPoints.length
              ]
            const t = idleState.current.segmentProgress

            idleState.current.x = start.x + (end.x - start.x) * t
            idleState.current.y = start.y + (end.y - start.y) * t
          } else {
            idleState.current.x = orderedPoints[0].x
            idleState.current.y = orderedPoints[0].y
          }

          let userIsNear = false
          if (userMousePos.current) {
            for (const p of points) {
              const dx = p.x - userMousePos.current.x
              const dy = p.y - userMousePos.current.y
              if (Math.sqrt(dx * dx + dy * dy) <= INTERACTION_RADIUS_PX) {
                userIsNear = true
                break
              }
            }
          }

          const withinTakeoverDelay =
            now - lastInteractiveTs.current <= IDLE_TAKEOVER_DELAY_MS

          const shouldUseUserTarget =
            Boolean(userMousePos.current) &&
            ((isHoveringInteractiveArea.current && userIsNear) ||
              withinTakeoverDelay)

          if (!shouldUseUserTarget && wasUsingUserTarget.current) {
            const px = mousePos.current.x
            const py = mousePos.current.y
            let bestSegment = 0
            let bestProgress = 0
            let bestDistanceSq = Infinity

            for (let i = 0; i < orderedPoints.length; i++) {
              const start = orderedPoints[i]
              const end = orderedPoints[(i + 1) % orderedPoints.length]
              const dx = end.x - start.x
              const dy = end.y - start.y
              const segmentLengthSq = dx * dx + dy * dy

              if (segmentLengthSq < 0.001) continue

              const projection =
                ((px - start.x) * dx + (py - start.y) * dy) / segmentLengthSq
              const t = Math.max(0, Math.min(1, projection))
              const projX = start.x + dx * t
              const projY = start.y + dy * t
              const distX = px - projX
              const distY = py - projY
              const distanceSq = distX * distX + distY * distY

              if (distanceSq < bestDistanceSq) {
                bestDistanceSq = distanceSq
                bestSegment = i
                bestProgress = t
              }
            }

            idleState.current.segmentIndex = bestSegment
            idleState.current.segmentProgress = bestProgress
            const start = orderedPoints[bestSegment]
            const end = orderedPoints[(bestSegment + 1) % orderedPoints.length]
            idleState.current.x = start.x + (end.x - start.x) * bestProgress
            idleState.current.y = start.y + (end.y - start.y) * bestProgress
          }

          wasUsingUserTarget.current = shouldUseUserTarget

          const target =
            shouldUseUserTarget && userMousePos.current
              ? userMousePos.current
              : { x: idleState.current.x, y: idleState.current.y }

          if (mousePos.current.x < -500 || mousePos.current.y < -500) {
            mousePos.current = { x: target.x, y: target.y }
          } else {
            const followLerp = shouldUseUserTarget ? 0.18 : 0.08
            mousePos.current.x += (target.x - mousePos.current.x) * followLerp
            mousePos.current.y += (target.y - mousePos.current.y) * followLerp
          }
        }

        ctx.save()

        const gradient = ctx.createLinearGradient(0, 0, width, height)
        gradient.addColorStop(0, 'rgba(255, 0, 129, 1)')
        gradient.addColorStop(1, 'rgba(112, 0, 255, 1)')

        ctx.strokeStyle = gradient
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        ctx.beginPath()
        ctx.moveTo(points[0].x, points[0].y)

        for (let i = 1; i < points.length; i++) {
          const cps = getControlPoint(points[i - 1], points[i - 2], points[i])
          const cpe = getControlPoint(
            points[i],
            points[i - 1],
            points[i + 1],
            true
          )
          ctx.bezierCurveTo(
            cps.x,
            cps.y,
            cpe.x,
            cpe.y,
            points[i].x,
            points[i].y
          )
        }

        ctx.stroke()

        ctx.globalCompositeOperation = 'destination-in'

        const maskGradient = ctx.createRadialGradient(
          mousePos.current.x,
          mousePos.current.y,
          0,
          mousePos.current.x,
          mousePos.current.y,
          isMobile && points.length > 3 ? 120 : 200
        )

        maskGradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
        maskGradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.5)')
        maskGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

        ctx.fillStyle = maskGradient
        ctx.fillRect(0, 0, width, height)

        ctx.restore()
      }
    }

    gsap.ticker.add(drawFrame)

    return () => {
      gsap.ticker.remove(drawFrame)
      window.removeEventListener('resize', resizeCanvas)
      lastFrameTs.current = null
    }
  }, [containerRef, bubbleRefs, isMobile])

  return <canvas ref={canvasRef} className={styles.connectionsCanvas} />
}

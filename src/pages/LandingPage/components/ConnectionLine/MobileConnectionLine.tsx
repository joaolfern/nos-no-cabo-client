import { useEffect, useRef, type RefObject } from 'react'
import gsap from 'gsap'
import type { BubbleInstance } from '../../LandingPage.types'
import styles from './ConnectionLine.module.scss'
import {
  buildConnectionPath,
  getWindowPieces,
  lengthToPosition,
  positionToLength,
  type Point,
} from '../../utils/connectionPath'

const SPEED_PX_PER_S = 230
const SPEED_REFERENCE_HEIGHT = 900
const MIN_BUBBLES = 4
const TRAIL_PX = 220
const LEAD_PX = 28

export function MobileConnectionLine({
  activeBubbles,
  bubbleRefs,
  containerRef,
}: {
  activeBubbles: BubbleInstance[]
  bubbleRefs: RefObject<Map<string, HTMLDivElement>>
  containerRef: RefObject<HTMLDivElement | null>
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const lastFrameTs = useRef<number | null>(null)
  const cachedContainerRect = useRef<DOMRect | null>(null)
  const headPosition = useRef<number | null>(null)
  const direction = useRef<1 | -1>(1)
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

    return () => {
      window.removeEventListener('resize', updateContainerRect)
      window.removeEventListener('scroll', updateContainerRect)
    }
  }, [containerRef])

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

    const getBubbleCenters = (containerRect: DOMRect) => {
      const centers: Point[] = []
      activeBubblesRef.current.forEach((bubble) => {
        const rect = bubbleRefs.current
          .get(bubble.uniqueId)
          ?.getBoundingClientRect()
        if (rect && rect.width > 0 && rect.height > 0) {
          centers.push({
            x: rect.left - containerRect.left + rect.width / 2,
            y: rect.top - containerRect.top + rect.height / 2,
          })
        }
      })
      return centers
    }

    const drawFrame = () => {
      const containerRect = cachedContainerRect.current
      if (!containerRect || !bubbleRefs.current) return

      const now = performance.now()
      const deltaSeconds =
        lastFrameTs.current === null
          ? 1 / 60
          : (now - lastFrameTs.current) / 1000
      lastFrameTs.current = now

      const { width, height } = containerRect
      ctx.clearRect(0, 0, width, height)

      const centers = getBubbleCenters(containerRect)
      if (centers.length < MIN_BUBBLES) return

      // The line starts upward, from the bottom pill toward the title.
      const path = buildConnectionPath(centers.reverse())
      let head =
        headPosition.current === null
          ? -LEAD_PX
          : positionToLength(path, headPosition.current)

      head +=
        direction.current *
        SPEED_PX_PER_S *
        (height / SPEED_REFERENCE_HEIGHT) *
        deltaSeconds

      if (direction.current === 1 && head - TRAIL_PX > path.total) {
        direction.current = -1
        head = path.total + LEAD_PX
      } else if (direction.current === -1 && head + TRAIL_PX < 0) {
        direction.current = 1
        head = -LEAD_PX
      }
      headPosition.current = lengthToPosition(path, head)

      const isForward = direction.current === 1
      const trail = {
        head,
        behind: isForward ? TRAIL_PX : LEAD_PX,
        ahead: isForward ? LEAD_PX : TRAIL_PX,
      }

      const gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, 'rgba(255, 0, 129, 1)')
      gradient.addColorStop(1, 'rgba(112, 0, 255, 1)')

      ctx.save()
      ctx.strokeStyle = gradient
      ctx.lineWidth = 2
      ctx.lineCap = 'butt'

      for (const piece of getWindowPieces(path, trail)) {
        ctx.globalAlpha = piece.opacity
        ctx.beginPath()
        ctx.moveTo(piece.start.x, piece.start.y)
        ctx.lineTo(piece.end.x, piece.end.y)
        ctx.stroke()
      }

      ctx.restore()
    }

    gsap.ticker.add(drawFrame)

    return () => {
      gsap.ticker.remove(drawFrame)
      window.removeEventListener('resize', resizeCanvas)
      lastFrameTs.current = null
    }
  }, [containerRef, bubbleRefs])

  return <canvas ref={canvasRef} className={styles.connectionsCanvas} />
}

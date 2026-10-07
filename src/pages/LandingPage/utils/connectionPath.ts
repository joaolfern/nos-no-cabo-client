export type Point = { x: number; y: number }

export type ConnectionPath = {
  samples: Point[]
  lengths: number[]
  nodeLengths: number[]
  total: number
}

export type PathWindow = {
  head: number
  behind: number
  ahead: number
}

const SAMPLES_PER_SEGMENT = 20
const FADE_STEP_PX = 2

const getControlPoint = (
  current: Point,
  previous: Point | undefined,
  next: Point | undefined,
  reverse?: boolean
) => {
  const p = previous || current
  const n = next || current
  const angle = Math.atan2(n.y - p.y, n.x - p.x) + (reverse ? Math.PI : 0)
  const length = Math.hypot(n.x - p.x, n.y - p.y) * 0.2
  return {
    x: current.x + Math.cos(angle) * length,
    y: current.y + Math.sin(angle) * length,
  }
}

const cubicAt = (a: number, b: number, c: number, d: number, t: number) => {
  const u = 1 - t
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d
}

export function buildConnectionPath(nodes: Point[]): ConnectionPath {
  const samples: Point[] = nodes.length > 0 ? [nodes[0]] : []

  for (let i = 1; i < nodes.length; i++) {
    const start = nodes[i - 1]
    const end = nodes[i]
    const cps = getControlPoint(start, nodes[i - 2], end)
    const cpe = getControlPoint(end, start, nodes[i + 1], true)

    for (let step = 1; step <= SAMPLES_PER_SEGMENT; step++) {
      const t = step / SAMPLES_PER_SEGMENT
      samples.push({
        x: cubicAt(start.x, cps.x, cpe.x, end.x, t),
        y: cubicAt(start.y, cps.y, cpe.y, end.y, t),
      })
    }
  }

  const lengths = samples.map(() => 0)
  for (let i = 1; i < samples.length; i++) {
    const a = samples[i - 1]
    const b = samples[i]
    lengths[i] = lengths[i - 1] + Math.hypot(b.x - a.x, b.y - a.y)
  }

  return {
    samples,
    lengths,
    nodeLengths: nodes.map((_, i) => lengths[i * SAMPLES_PER_SEGMENT]),
    total: lengths[lengths.length - 1] ?? 0,
  }
}

const getSegmentBounds = (path: ConnectionPath, segment: number) => {
  const start = path.nodeLengths[segment]
  const span = Math.max(path.nodeLengths[segment + 1] - start, 0.001)
  return { start, span }
}

/**
 * A position counts pills, not pixels: 2.5 is halfway between the third and fourth pill,
 * so it stays put on screen while the pills around it float and the curve changes length.
 */
export function positionToLength(path: ConnectionPath, position: number) {
  const lastSegment = path.nodeLengths.length - 2
  if (lastSegment < 0) return 0

  const segment = Math.max(0, Math.min(lastSegment, Math.floor(position)))
  const { start, span } = getSegmentBounds(path, segment)
  return start + (position - segment) * span
}

export function lengthToPosition(path: ConnectionPath, length: number) {
  const lastSegment = path.nodeLengths.length - 2
  if (lastSegment < 0) return 0

  let segment = 0
  while (segment < lastSegment && path.nodeLengths[segment + 1] <= length) {
    segment++
  }
  const { start, span } = getSegmentBounds(path, segment)
  return segment + (length - start) / span
}

const smoothstep = (t: number) => {
  const clamped = Math.max(0, Math.min(1, t))
  return clamped * clamped * (3 - 2 * clamped)
}

export function getWindowOpacity(length: number, window: PathWindow) {
  const offset = length - window.head
  if (offset <= 0) return smoothstep(1 + offset / window.behind)
  return smoothstep(1 - offset / window.ahead)
}

const pointAlong = (a: Point, b: Point, t: number) => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
})

/** Splits the stretch of the path inside the window into short pieces with their opacity. */
export function getWindowPieces(path: ConnectionPath, window: PathWindow) {
  const from = window.head - window.behind
  const to = window.head + window.ahead
  const pieces: { start: Point; end: Point; opacity: number }[] = []

  for (let i = 1; i < path.samples.length; i++) {
    const startLength = path.lengths[i - 1]
    const endLength = path.lengths[i]
    const span = endLength - startLength
    if (endLength <= from || startLength >= to || span < 0.001) continue

    const clippedStart = Math.max(startLength, from)
    const clippedEnd = Math.min(endLength, to)
    const a = path.samples[i - 1]
    const b = path.samples[i]
    const steps = Math.ceil((clippedEnd - clippedStart) / FADE_STEP_PX)

    for (let step = 0; step < steps; step++) {
      const pieceStart =
        clippedStart + ((clippedEnd - clippedStart) * step) / steps
      const pieceEnd =
        clippedStart + ((clippedEnd - clippedStart) * (step + 1)) / steps

      pieces.push({
        start: pointAlong(a, b, (pieceStart - startLength) / span),
        end: pointAlong(a, b, (pieceEnd - startLength) / span),
        opacity: getWindowOpacity((pieceStart + pieceEnd) / 2, window),
      })
    }
  }

  return pieces
}

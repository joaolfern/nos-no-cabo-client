import { describe, expect, it } from 'vitest'
import {
  buildConnectionPath,
  getWindowOpacity,
  getWindowPieces,
  lengthToPosition,
  positionToLength,
} from './connectionPath'

const straightPath = buildConnectionPath([
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 200, y: 0 },
])

const zigZagPath = buildConnectionPath([
  { x: 0, y: 0 },
  { x: 300, y: 40 },
  { x: 0, y: 80 },
  { x: 300, y: 120 },
])

describe('buildConnectionPath', () => {
  it('measures the path through every node', () => {
    expect(straightPath.total).toBeCloseTo(200)
    expect(straightPath.samples.at(-1)).toEqual({ x: 200, y: 0 })
  })
})

describe('getWindowOpacity', () => {
  const window = { head: 100, behind: 50, ahead: 10 }

  it('is solid at the head and fades out at both ends', () => {
    expect(getWindowOpacity(100, window)).toBe(1)
    expect(getWindowOpacity(50, window)).toBe(0)
    expect(getWindowOpacity(110, window)).toBe(0)
  })
})

describe('getWindowPieces', () => {
  it('draws only the stretch of the path around the head', () => {
    const pieces = getWindowPieces(straightPath, {
      head: 120,
      behind: 40,
      ahead: 10,
    })
    const xs = pieces.flatMap((piece) => [piece.start.x, piece.end.x])

    expect(Math.min(...xs)).toBeCloseTo(80)
    expect(Math.max(...xs)).toBeCloseTo(130)
  })

  it('never lights a row that is only close on screen', () => {
    const head = positionToLength(zigZagPath, 1.5)
    const pieces = getWindowPieces(zigZagPath, { head, behind: 60, ahead: 10 })
    const ys = pieces.flatMap((piece) => [piece.start.y, piece.end.y])

    expect(Math.min(...ys)).toBeGreaterThan(40)
    expect(Math.max(...ys)).toBeLessThan(80)
  })
})

describe('positionToLength', () => {
  it('keeps a spot between two pills when an earlier pill moves away', () => {
    const position = lengthToPosition(straightPath, 150)
    const stretched = buildConnectionPath([
      { x: -100, y: 0 },
      { x: 100, y: 0 },
      { x: 200, y: 0 },
    ])

    expect(position).toBeCloseTo(1.5)
    expect(positionToLength(stretched, position)).toBeCloseTo(250)
  })

  it('extends past both ends of the path', () => {
    expect(positionToLength(straightPath, -0.5)).toBeCloseTo(-50)
    expect(lengthToPosition(straightPath, 250)).toBeCloseTo(2.5)
  })
})

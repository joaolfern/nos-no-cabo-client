import type { WebsiteBubbleProps } from '../Website/components/WebsiteBubble/WebsiteBubble.types'

export type BubbleInstance = {
  uniqueId: string
  item: WebsiteBubbleProps
  config: BubbleTrajectoryConfig
}

export type BubbleTrajectoryConfig = {
  lane: number
  size: number
  /** Widest the pill may be, so it stays inside the screen. */
  width?: number
  /** Phones: the side the pill hangs from, and its distance from that edge (% of width). */
  side?: 'left' | 'right'
  inset?: number
  /** Vertical position as a percentage of container height (0–100) */
  top: number
  wiggleDuration: number
  wiggleOffset: number
  wiggleOffsetY: number
  floatDepth: number
  floatPhase: number
}

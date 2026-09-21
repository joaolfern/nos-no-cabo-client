import type { WebsiteBubbleProps } from '../Website/components/WebsiteBubble/WebsiteBubble.types'

export type BubbleInstance = {
  uniqueId: string
  item: WebsiteBubbleProps
  config: BubbleTrajectoryConfig
}

export type BubbleTrajectoryConfig = {
  lane: number
  size: number
  /** Vertical position as a percentage of container height (0–100) */
  top: number
  wiggleDuration: number
  wiggleOffset: number
  wiggleOffsetY: number
  floatDepth: number
  floatPhase: number
}

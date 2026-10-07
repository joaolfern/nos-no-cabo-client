import { getIsMobile } from '@/utils/getIsMobile/getIsMobile'

const MIN_LANE_COUNT = 3
const MAX_LANE_COUNT = 12
const MOBILE_LANE_SIZE_PX = 96
const DESKTOP_LANE_SIZE_PX = 132
const HORIZONTAL_GUTTER_PX = 24
const PHONE_MAX_WIDTH_PX = 600
export const PHONE_LANE_COUNT = 2
export const BUBBLE_LANE_PADDING_PX = 16

export function getLaneCount(
  viewportWidth = window.innerWidth,
  laneSizePx?: number
) {
  if (viewportWidth < PHONE_MAX_WIDTH_PX) return PHONE_LANE_COUNT

  const isMobileViewport = getIsMobile(viewportWidth)
  const targetLaneSize =
    laneSizePx ||
    (isMobileViewport ? MOBILE_LANE_SIZE_PX : DESKTOP_LANE_SIZE_PX)

  const usableWidth = Math.max(
    targetLaneSize,
    viewportWidth - HORIZONTAL_GUTTER_PX * 2
  )
  const computed = Math.floor(usableWidth / targetLaneSize)

  return Math.min(MAX_LANE_COUNT, Math.max(MIN_LANE_COUNT, computed))
}

// Fewer sites than lanes: keep them in the middle lanes instead of crowding the left.
export function getCenteredLane(
  index: number,
  itemCount: number,
  laneCount: number
) {
  return index + Math.max(0, (laneCount - itemCount) / 2)
}

export const LANE_COUNT = getLaneCount(window.innerWidth)

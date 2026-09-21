import { getIsMobile } from '@/utils/getIsMobile/getIsMobile'

const MIN_LANE_COUNT = 3
const MAX_LANE_COUNT = 12
const MOBILE_LANE_SIZE_PX = 96
const DESKTOP_LANE_SIZE_PX = 132
const HORIZONTAL_GUTTER_PX = 24

export function getLaneCount(
  viewportWidth = window.innerWidth,
  laneSizePx?: number
) {
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

export const LANE_COUNT = getLaneCount(window.innerWidth)

const MOBILE_BREAKPOINT = 1024

export function getIsMobile(width: number) {
  return width < MOBILE_BREAKPOINT
}

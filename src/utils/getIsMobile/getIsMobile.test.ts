import { getIsMobile } from './getIsMobile'

describe('getIsMobile', () => {
  it('should return true for width less than MOBILE_BREAKPOINT', () => {
    expect(getIsMobile(800)).toBe(true)
    expect(getIsMobile(0)).toBe(true)
    expect(getIsMobile(1023)).toBe(true)
  })

  it('should return false for width equal to MOBILE_BREAKPOINT', () => {
    expect(getIsMobile(1024)).toBe(false)
  })

  it('should return false for width greater than MOBILE_BREAKPOINT', () => {
    expect(getIsMobile(1200)).toBe(false)
    expect(getIsMobile(2000)).toBe(false)
  })
})

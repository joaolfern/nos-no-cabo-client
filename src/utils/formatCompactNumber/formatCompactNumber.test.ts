import { formatCompactNumber } from './formatCompactNumber'

describe('formatCompactNumber', () => {
  it('keeps numbers under a thousand as they are', () => {
    expect(formatCompactNumber(0)).toBe('0')
    expect(formatCompactNumber(84)).toBe('84')
    expect(formatCompactNumber(999)).toBe('999')
  })

  it('abbreviates thousands with one decimal at most', () => {
    expect(formatCompactNumber(1000)).toBe('1k')
    expect(formatCompactNumber(1234)).toBe('1.2k')
    expect(formatCompactNumber(15678)).toBe('15.7k')
  })

  it('moves to the next unit when rounding reaches it', () => {
    expect(formatCompactNumber(999950)).toBe('1M')
    expect(formatCompactNumber(1234567)).toBe('1.2M')
  })
})

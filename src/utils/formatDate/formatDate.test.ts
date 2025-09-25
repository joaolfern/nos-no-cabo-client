import { formatDate } from './formatDate'
describe('formatDate', () => {
  it('formats date in default format', () => {
    expect(formatDate('2025-08-28', 'default')).toBe('August 28, 2025')
  })

  it('formats date in short format', () => {
    expect(formatDate('2025-08-28', 'short')).toBe('Aug 28, 2025')
  })

  it('returns - for invalid date', () => {
    expect(formatDate('invalid-date', 'default')).toBe('-')
    expect(formatDate('', 'short')).toBe('-')
  })

  it('handles leap year date', () => {
    expect(formatDate('2024-02-29', 'default')).toBe('February 29, 2024')
    expect(formatDate('2024-02-29', 'short')).toBe('Feb 29, 2024')
  })

  it('formats ISO string with time', () => {
    expect(formatDate('2025-07-23T08:54:46.042Z', 'default')).toBe(
      'July 23, 2025'
    )
    expect(formatDate('2025-07-23T08:54:46.042Z', 'short')).toBe('Jul 23, 2025')
  })

  it('formats date with single-digit month and day', () => {
    expect(formatDate('2025-01-05', 'default')).toBe('January 5, 2025')
    expect(formatDate('2025-01-05', 'short')).toBe('Jan 5, 2025')
  })

  it('formats date with different centuries', () => {
    expect(formatDate('1999-12-31', 'default')).toBe('December 31, 1999')
    expect(formatDate('2100-01-01', 'short')).toBe('Jan 1, 2100')
  })

  it('formats date with timezone offset', () => {
    expect(formatDate('2025-07-23T08:54:46.042+02:00', 'default')).toBe(
      'July 23, 2025'
    )
    expect(formatDate('2025-07-23T08:54:46.042-05:00', 'short')).toBe(
      'Jul 23, 2025'
    )
  })
})

type Format = 'short' | 'default'

const FORMATS: Record<Format, Intl.DateTimeFormatOptions> = {
  short: { month: 'short', day: 'numeric', year: 'numeric' },
  default: { month: 'long', day: 'numeric', year: 'numeric' },
}

const UTC_SUFFIX = 'Z'
const TIMEZONE_REGEX = /Z$|[+-]\d{2}:\d{2}$/
const TIME_SEPARATOR = 'T'
const TIME_APPEND = 'T00:00:00Z'

function toUTCDateString(date: string): string {
  // If date already ends with UTC suffix or has a timezone, return as is
  if (TIMEZONE_REGEX.test(date)) return date
  // If date includes time separator, append UTC suffix
  if (date.includes(TIME_SEPARATOR))
    return date.replace(/(T.*)$/, `$1${UTC_SUFFIX}`)
  // Otherwise, treat as date only and append default UTC time
  return date + TIME_APPEND
}

export function formatDate(date: string, format: Format): string {
  const utcDateString = toUTCDateString(date)
  const d = new Date(utcDateString)

  if (isNaN(d.getTime())) return '-'

  return d.toLocaleDateString('en-US', {
    ...FORMATS[format],
    timeZone: 'UTC',
  })
}

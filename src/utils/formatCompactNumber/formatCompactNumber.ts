const compactFormatter = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

export function formatCompactNumber(value: number) {
  return compactFormatter.format(value).replace('K', 'k')
}

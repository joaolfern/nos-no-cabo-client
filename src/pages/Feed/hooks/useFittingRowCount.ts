import { useCallback, useLayoutEffect, useState, type RefObject } from 'react'

type RowMetrics = {
  available: number
  offset: number
  rowHeight: number
  gap: number
}

const isSameMetrics = (a: RowMetrics, b: RowMetrics) =>
  a.available === b.available &&
  a.offset === b.offset &&
  a.rowHeight === b.rowHeight &&
  a.gap === b.gap

// Rows are the region's buttons; offset is the space above the first one.
export function useFittingRowCount(
  regionRef: RefObject<HTMLElement | null>,
  listSelector: string
) {
  const [metrics, setMetrics] = useState<RowMetrics | null>(null)

  const measure = useCallback(() => {
    const region = regionRef.current
    const list = region?.querySelector<HTMLElement>(listSelector)
    const row = list?.querySelector('button')
    if (!region || !list || !row) return

    const next = {
      available: region.clientHeight,
      offset:
        row.getBoundingClientRect().top - region.getBoundingClientRect().top,
      rowHeight: row.offsetHeight,
      gap: parseFloat(getComputedStyle(list).rowGap) || 0,
    }

    setMetrics((previous) =>
      previous && isSameMetrics(previous, next) ? previous : next
    )
  }, [regionRef, listSelector])

  useLayoutEffect(measure)

  useLayoutEffect(() => {
    const region = regionRef.current
    if (!region || typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver(measure)
    observer.observe(region)
    return () => observer.disconnect()
  }, [regionRef, measure])

  if (!metrics || metrics.rowHeight <= 0) {
    return { capacity: Infinity, heightForRows: () => undefined }
  }

  const { available, offset, rowHeight, gap } = metrics
  return {
    capacity: Math.floor((available - offset + gap) / (rowHeight + gap)),
    heightForRows: (rows: number) =>
      offset + rows * rowHeight + (rows - 1) * gap,
  }
}

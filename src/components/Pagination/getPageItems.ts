export type PageItem = number | 'start-ellipsis' | 'end-ellipsis'

const MAX_WITHOUT_ELLIPSIS = 7
const EDGE_SPAN = 4

function range(from: number, to: number) {
  return Array.from({ length: to - from + 1 }, (_, index) => from + index)
}

// Builds the sequence of page buttons. Long ranges collapse into ellipses and
// always render seven items, so the control keeps a stable width.
export function getPageItems(page: number, pageCount: number): PageItem[] {
  if (pageCount <= MAX_WITHOUT_ELLIPSIS) return range(1, pageCount)

  if (page <= EDGE_SPAN) {
    return [...range(1, EDGE_SPAN + 1), 'end-ellipsis', pageCount]
  }

  if (page >= pageCount - EDGE_SPAN + 1) {
    return [1, 'start-ellipsis', ...range(pageCount - EDGE_SPAN, pageCount)]
  }

  return [
    1,
    'start-ellipsis',
    page - 1,
    page,
    page + 1,
    'end-ellipsis',
    pageCount,
  ]
}

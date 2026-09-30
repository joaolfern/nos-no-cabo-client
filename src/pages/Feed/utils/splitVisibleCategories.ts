export const MIN_VISIBLE_CATEGORIES = 3

// maxRows counts every row in the list: "Todos", the categories and, when
// some are hidden, the "Mais categorias" row.
export function splitVisibleCategories<T extends { value: string }>(
  options: T[],
  maxRows: number,
  selected: string | null
): { visible: T[]; hidden: T[] } {
  const categoryRows = maxRows - 1

  if (options.length <= categoryRows) {
    return { visible: options, hidden: [] }
  }

  const visibleCount = Math.max(MIN_VISIBLE_CATEGORIES, categoryRows - 1)
  let visible = options.slice(0, visibleCount)
  const selectedOption = options.find((option) => option.value === selected)

  if (selectedOption && !visible.includes(selectedOption)) {
    visible = [...visible.slice(0, -1), selectedOption]
  }

  return {
    visible,
    hidden: options.filter((option) => !visible.includes(option)),
  }
}

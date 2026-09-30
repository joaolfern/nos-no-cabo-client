import {
  MIN_VISIBLE_CATEGORIES,
  splitVisibleCategories,
} from './splitVisibleCategories'

const options = ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map((value) => ({ value }))
const values = (list: { value: string }[]) => list.map((item) => item.value)

describe('splitVisibleCategories', () => {
  it('shows everything when all rows fit', () => {
    const { visible, hidden } = splitVisibleCategories(options, 8, null)

    expect(values(visible)).toEqual(values(options))
    expect(hidden).toEqual([])
  })

  it('keeps one row for "Todos" and one for "Mais" when some are hidden', () => {
    const { visible, hidden } = splitVisibleCategories(options, 7, null)

    expect(values(visible)).toEqual(['a', 'b', 'c', 'd', 'e'])
    expect(values(hidden)).toEqual(['f', 'g'])
  })

  it('never shows fewer than the minimum', () => {
    const { visible } = splitVisibleCategories(options, 2, null)

    expect(visible).toHaveLength(MIN_VISIBLE_CATEGORIES)
  })

  it('brings a hidden selected category into the last visible slot', () => {
    const { visible, hidden } = splitVisibleCategories(options, 5, 'g')

    expect(values(visible)).toEqual(['a', 'b', 'g'])
    expect(values(hidden)).toEqual(['c', 'd', 'e', 'f'])
  })

  it('leaves the order alone when the selected category is already visible', () => {
    const { visible } = splitVisibleCategories(options, 5, 'b')

    expect(values(visible)).toEqual(['a', 'b', 'c'])
  })
})

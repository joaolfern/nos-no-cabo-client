import { getPageItems } from './getPageItems'

describe('getPageItems', () => {
  it('lists every page when there are few', () => {
    expect(getPageItems(1, 1)).toEqual([1])
    expect(getPageItems(2, 3)).toEqual([1, 2, 3])
    expect(getPageItems(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('collapses the end when near the first page', () => {
    expect(getPageItems(1, 10)).toEqual([1, 2, 3, 4, 5, 'end-ellipsis', 10])
    expect(getPageItems(4, 10)).toEqual([1, 2, 3, 4, 5, 'end-ellipsis', 10])
  })

  it('collapses both sides in the middle', () => {
    expect(getPageItems(5, 10)).toEqual([
      1,
      'start-ellipsis',
      4,
      5,
      6,
      'end-ellipsis',
      10,
    ])
  })

  it('collapses the start when near the last page', () => {
    expect(getPageItems(7, 10)).toEqual([1, 'start-ellipsis', 6, 7, 8, 9, 10])
    expect(getPageItems(10, 10)).toEqual([1, 'start-ellipsis', 6, 7, 8, 9, 10])
  })

  it('always renders seven items for long ranges', () => {
    for (let page = 1; page <= 20; page++) {
      expect(getPageItems(page, 20)).toHaveLength(7)
    }
  })
})

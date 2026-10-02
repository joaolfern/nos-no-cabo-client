import { countsBySlug, sortByCountDesc } from './keywordCounts'

describe('countsBySlug', () => {
  it('maps each category slug to its count from the server', () => {
    const counts = countsBySlug({
      total: 3,
      items: [
        { slug: 'educacao', count: 2 },
        { slug: 'saude', count: 1 },
      ],
    })

    expect(counts.get('educacao')).toBe(2)
    expect(counts.get('saude')).toBe(1)
    expect(counts.get('cidades')).toBeUndefined()
  })

  it('is empty while the categories load', () => {
    expect(countsBySlug(undefined).size).toBe(0)
  })
})

describe('sortByCountDesc', () => {
  const counts = new Map([
    ['a', 1],
    ['b', 3],
    ['c', 3],
  ])

  it('sorts by count, keeping the original order for ties', () => {
    const options = [{ value: 'a' }, { value: 'b' }, { value: 'c' }]

    expect(sortByCountDesc(options, counts).map((o) => o.value)).toEqual([
      'b',
      'c',
      'a',
    ])
  })

  it('treats a missing count as zero and does not mutate the input', () => {
    const options = [{ value: 'x' }, { value: 'a' }]
    const sorted = sortByCountDesc(options, counts)

    expect(sorted.map((o) => o.value)).toEqual(['a', 'x'])
    expect(options.map((o) => o.value)).toEqual(['x', 'a'])
  })
})

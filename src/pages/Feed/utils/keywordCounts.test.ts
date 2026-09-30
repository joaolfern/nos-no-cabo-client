import type { IKeyword, IWebsite } from '@/interfaces/IWebsite'
import { countWebsitesByKeyword, sortByCountDesc } from './keywordCounts'

const web: IKeyword = { id: 'web', name: 'web' }
const code: IKeyword = { id: 'code', name: 'code' }
const docs: IKeyword = { id: 'docs', name: 'docs' }

function website(id: string, keywords: IKeyword[]) {
  return { id, keywords } as IWebsite
}

describe('countWebsitesByKeyword', () => {
  it('counts how many websites use each keyword', () => {
    const counts = countWebsitesByKeyword([
      website('1', [web, code]),
      website('2', [web]),
      website('3', [docs]),
    ])

    expect(counts.get('web')).toBe(2)
    expect(counts.get('code')).toBe(1)
    expect(counts.get('docs')).toBe(1)
  })

  it('counts a keyword once per website even if it is repeated', () => {
    const counts = countWebsitesByKeyword([website('1', [web, web])])

    expect(counts.get('web')).toBe(1)
  })

  it('handles missing data', () => {
    expect(countWebsitesByKeyword(undefined).size).toBe(0)
    expect(countWebsitesByKeyword([]).size).toBe(0)
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

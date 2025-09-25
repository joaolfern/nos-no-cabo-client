import { MOCK_WEBSITES } from '@/__mocks__/data/websites'
import { sortWebsites } from './sortWebsites'

const mockedWebsites = [MOCK_WEBSITES[0], MOCK_WEBSITES[1], MOCK_WEBSITES[2]]

describe('sortWebsites', () => {
  it('sorts by date ascending', () => {
    const sorted = sortWebsites(mockedWebsites, 'date_asc')
    expect(sorted.map((p) => p.id)).toEqual(['3', '1', '2'])
  })

  it('sorts by date descending', () => {
    const sorted = sortWebsites(mockedWebsites, 'date_desc')
    expect(sorted.map((p) => p.id)).toEqual(['2', '1', '3'])
  })

  it('sorts by title ascending', () => {
    const sorted = sortWebsites(mockedWebsites, 'title_asc')
    expect(sorted.map((p) => p.id)).toEqual(['1', '3', '2'])
  })

  it('sorts by title descending', () => {
    const sorted = sortWebsites(mockedWebsites, 'title_desc')
    expect(sorted.map((p) => p.id)).toEqual(['2', '3', '1'])
  })

  it('returns original order for unknown sortType', () => {
    // @ts-expect-error testing invalid sortType
    const sorted = sortWebsites(mockedWebsites, 'unknown')
    expect(sorted.map((p) => p.id)).toEqual(['1', '2', '3'])
  })
})

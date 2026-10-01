import { rankScore, rankWebsites } from '@/__mocks__/data/ranking'
import { MOCK_WEBSITES } from '@/__mocks__/data/websites'

describe('rankScore', () => {
  it('values recent clicks more than all-time clicks', () => {
    const recent = rankScore({
      recentClicks: 100,
      totalClicks: 100,
      verified: false,
    })
    const old = rankScore({
      recentClicks: 10,
      totalClicks: 1000,
      verified: false,
    })

    expect(recent).toBeGreaterThan(old)
  })

  it('gives verified sites a bonus without overriding usage', () => {
    const base = { recentClicks: 50, totalClicks: 500 }

    expect(rankScore({ ...base, verified: true })).toBeGreaterThan(
      rankScore({ ...base, verified: false })
    )
    expect(
      rankScore({ recentClicks: 5, totalClicks: 50, verified: true })
    ).toBeLessThan(rankScore({ ...base, verified: false }))
  })
})

describe('rankWebsites', () => {
  it('returns every site, without mutating the input', () => {
    const input = [...MOCK_WEBSITES]
    const ranked = rankWebsites(input)

    expect(ranked).toHaveLength(input.length)
    expect(new Set(ranked.map(({ id }) => id))).toEqual(
      new Set(input.map(({ id }) => id))
    )
    expect(input).toEqual(MOCK_WEBSITES)
  })
})

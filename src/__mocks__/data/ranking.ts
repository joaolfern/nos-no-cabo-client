import type { IWebsite } from '@/interfaces/IWebsite'
import { mockStats } from '@/__mocks__/data/metrics'

const RECENT_CLICKS_WEIGHT = 3
const VERIFIED_BONUS = 2

type RankSignals = {
  recentClicks: number
  totalClicks: number
  verified: boolean
}

// Mirrors the backend's "Melhores" score (docs/architecture/decisions/0004-ranking.md).
export function rankScore({
  recentClicks,
  totalClicks,
  verified,
}: RankSignals) {
  return (
    RECENT_CLICKS_WEIGHT * Math.log1p(recentClicks) +
    Math.log1p(totalClicks) +
    (verified ? VERIFIED_BONUS : 0)
  )
}

function websiteScore(website: IWebsite) {
  const stats = mockStats(website.id)

  return rankScore({
    recentClicks: stats.clicks30d,
    totalClicks: stats.clicks,
    verified: Boolean(website.verifiedAt),
  })
}

export function rankWebsites(websites: IWebsite[]) {
  return [...websites].sort(
    (a, b) =>
      websiteScore(b) - websiteScore(a) ||
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

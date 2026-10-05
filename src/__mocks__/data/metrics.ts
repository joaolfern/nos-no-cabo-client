import type { IVoteValue, IWebsiteStats } from '@/interfaces/IWebsiteStats'

// Deterministic per-id pseudo-random int, so a site always shows the same seeded numbers.
function seededInt(seed: string, salt: number, min: number, max: number) {
  let hash = 2166136261 ^ salt
  for (const char of seed) {
    hash = Math.imul(hash ^ char.charCodeAt(0), 16777619)
  }
  hash = Math.imul(hash ^ (hash >>> 15), 2246822507)
  hash ^= hash >>> 13
  const normalized = (hash >>> 0) / 4294967296
  return Math.floor(min + normalized * (max - min))
}

const votes = new Map<string, Map<string, 1 | -1>>()

export function resetMockMetrics() {
  votes.clear()
}

function seededStats(websiteId: string): IWebsiteStats {
  return {
    clicks: seededInt(websiteId, 1, 800, 12000),
    clicks30d: seededInt(websiteId, 2, 40, 900),
    referrals: seededInt(websiteId, 3, 200, 3000),
    likes: seededInt(websiteId, 4, 0, 150),
    dislikes: seededInt(websiteId, 5, 0, 20),
  }
}

export function mockStats(websiteId: string): IWebsiteStats {
  const stats = seededStats(websiteId)
  for (const value of votes.get(websiteId)?.values() ?? []) {
    if (value === 1) stats.likes += 1
    else stats.dislikes += 1
  }
  return stats
}

export function mockNetLikes(websiteId: string) {
  const { likes, dislikes } = mockStats(websiteId)
  return likes - dislikes
}

export function applyMockVote(
  websiteId: string,
  voterId: string,
  value: IVoteValue
) {
  const siteVotes = votes.get(websiteId) ?? new Map<string, 1 | -1>()
  if (value === 0) siteVotes.delete(voterId)
  else siteVotes.set(voterId, value)
  votes.set(websiteId, siteVotes)
}

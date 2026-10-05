import type { IVoteValue } from '@/interfaces/IWebsiteStats'

const VOTER_KEY = 'nnc-voter'
const VOTES_KEY = 'nnc-votes'

let sessionVoterId: string | undefined

function readVotes(): Record<string, IVoteValue> {
  try {
    return JSON.parse(localStorage.getItem(VOTES_KEY) ?? '{}')
  } catch {
    return {}
  }
}

// Without storage the id lasts until the page reloads, which is still one vote per visit.
export function getVoterId() {
  try {
    const stored = localStorage.getItem(VOTER_KEY)
    if (stored) return stored
    const created = crypto.randomUUID()
    localStorage.setItem(VOTER_KEY, created)
    return created
  } catch {
    sessionVoterId ??= crypto.randomUUID()
    return sessionVoterId
  }
}

export function getStoredVote(websiteId: string): IVoteValue {
  return readVotes()[websiteId] ?? 0
}

export function storeVote(websiteId: string, value: IVoteValue) {
  const votes = readVotes()
  if (value === 0) delete votes[websiteId]
  else votes[websiteId] = value
  try {
    localStorage.setItem(VOTES_KEY, JSON.stringify(votes))
  } catch {
    return
  }
}

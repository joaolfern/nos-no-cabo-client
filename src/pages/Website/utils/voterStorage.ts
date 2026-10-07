import type { IVoteValue } from '@/interfaces/IWebsiteStats'

const VOTER_KEY = 'nnc-voter'
const VOTES_KEY = 'nnc-votes'
const PENDING_VOTES_KEY = 'nnc-pending-votes'

let sessionVoterId: string | undefined

type VoteMap = Record<string, IVoteValue>

function readVoteMap(key: string): VoteMap {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '{}')
  } catch {
    return {}
  }
}

function writeVoteMap(key: string, votes: VoteMap) {
  try {
    localStorage.setItem(key, JSON.stringify(votes))
  } catch {
    return
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
  return readVoteMap(VOTES_KEY)[websiteId] ?? 0
}

export function storeVote(websiteId: string, value: IVoteValue) {
  const votes = readVoteMap(VOTES_KEY)
  if (value === 0) delete votes[websiteId]
  else votes[websiteId] = value
  writeVoteMap(VOTES_KEY, votes)
}

export function getPendingVote(websiteId: string): IVoteValue | null {
  return readVoteMap(PENDING_VOTES_KEY)[websiteId] ?? null
}

export function storePendingVote(websiteId: string, value: IVoteValue) {
  writeVoteMap(PENDING_VOTES_KEY, {
    ...readVoteMap(PENDING_VOTES_KEY),
    [websiteId]: value,
  })
}

export function clearPendingVote(websiteId: string) {
  const votes = readVoteMap(PENDING_VOTES_KEY)
  delete votes[websiteId]
  writeVoteMap(PENDING_VOTES_KEY, votes)
}

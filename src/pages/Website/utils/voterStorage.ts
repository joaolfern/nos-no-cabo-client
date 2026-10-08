import type { IVoteValue } from '@/interfaces/IWebsiteStats'

const VOTER_KEY = 'nnc-voter'
const VOTES_KEY = 'nnc-votes'
const PENDING_VOTES_KEY = 'nnc-pending-votes'

let sessionVoterId: string | undefined
const listeners = new Set<() => void>()

type VoteMap = Record<string, IVoteValue>

export type VotesSnapshot = { saved: VoteMap; pending: VoteMap }

let snapshot: VotesSnapshot = { saved: {}, pending: {} }
let snapshotSource = ''

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
  listeners.forEach((listener) => listener())
}

export function subscribeToVotes(onChange: () => void) {
  listeners.add(onChange)
  window.addEventListener('storage', onChange)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener('storage', onChange)
  }
}

function readRaw(key: string) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

// Stable until the stored votes change, as useSyncExternalStore requires.
export function getVotesSnapshot(): VotesSnapshot {
  const source = `${readRaw(VOTES_KEY)}|${readRaw(PENDING_VOTES_KEY)}`
  if (source !== snapshotSource) {
    snapshotSource = source
    snapshot = {
      saved: readVoteMap(VOTES_KEY),
      pending: readVoteMap(PENDING_VOTES_KEY),
    }
  }
  return snapshot
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

// Cached net likes already count the saved vote; swap it for one still waiting on Turnstile.
export function withPendingVote(
  votes: VotesSnapshot,
  websiteId: string,
  netLikes: number
) {
  const pending = votes.pending[websiteId]
  if (pending === undefined) return netLikes
  return netLikes - (votes.saved[websiteId] ?? 0) + pending
}

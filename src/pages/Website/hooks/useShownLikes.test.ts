import { act, renderHook } from '@testing-library/react'
import { useShownLikes } from '@/pages/Website/hooks/useShownLikes'
import {
  clearPendingVote,
  storePendingVote,
  storeVote,
} from '@/pages/Website/utils/voterStorage'

const website = { id: '1', likes: 10 }

beforeEach(() => {
  localStorage.clear()
})

describe('useShownLikes', () => {
  it('shows the cached net likes when no vote is pending', () => {
    storeVote('1', 1)
    const { result } = renderHook(() => useShownLikes())

    expect(result.current(website)).toBe(10)
  })

  it('swaps the saved vote for the pending one as soon as it is chosen', () => {
    storeVote('1', 1)
    const { result } = renderHook(() => useShownLikes())

    act(() => storePendingVote('1', -1))
    expect(result.current(website)).toBe(8)

    act(() => storePendingVote('1', 0))
    expect(result.current(website)).toBe(9)

    act(() => clearPendingVote('1'))
    expect(result.current(website)).toBe(10)
  })

  it('leaves other websites alone', () => {
    storePendingVote('1', 1)
    const { result } = renderHook(() => useShownLikes())

    expect(result.current({ id: '2', likes: 3 })).toBe(3)
  })
})

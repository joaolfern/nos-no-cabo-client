import {
  ACTIVE_CHECK_WINDOW_MS,
  DRAFT_TTL_MS,
  isExpired,
  isInActiveCheckWindow,
  isPendingSubmissionList,
  reconcileDrafts,
  type IPendingSubmission,
} from './pendingSubmissions'

const SUBMITTED_AT = '2026-09-30T12:00:00.000Z'
const SUBMITTED_MS = Date.parse(SUBMITTED_AT)

function draft(
  overrides: Partial<IPendingSubmission> = {}
): IPendingSubmission {
  return {
    id: 'a',
    url: 'https://a.dev/',
    name: 'A',
    description: '',
    color: null,
    faviconUrl: null,
    categories: ['educacao'],
    status: 'checking',
    submittedAt: SUBMITTED_AT,
    ...overrides,
  }
}

describe('isPendingSubmissionList', () => {
  it('accepts stored drafts and rejects anything else', () => {
    expect(isPendingSubmissionList([draft()])).toBe(true)
    expect(isPendingSubmissionList([{ id: 'a' }])).toBe(false)
    expect(isPendingSubmissionList([draft({ status: 'published' })])).toBe(
      false
    )
    expect(isPendingSubmissionList('nope')).toBe(false)
  })
})

describe('timing', () => {
  it('expires drafts after 7 days', () => {
    expect(isExpired(draft(), SUBMITTED_MS + DRAFT_TTL_MS - 1)).toBe(false)
    expect(isExpired(draft(), SUBMITTED_MS + DRAFT_TTL_MS)).toBe(true)
  })

  it('actively checks only checking drafts in their first 2 minutes', () => {
    expect(isInActiveCheckWindow(draft(), SUBMITTED_MS + 1000)).toBe(true)
    expect(
      isInActiveCheckWindow(draft(), SUBMITTED_MS + ACTIVE_CHECK_WINDOW_MS)
    ).toBe(false)
    expect(
      isInActiveCheckWindow(draft({ status: 'rejected' }), SUBMITTED_MS)
    ).toBe(false)
  })
})

describe('reconcileDrafts', () => {
  it('splits final statuses into published and rejected drafts', () => {
    const drafts = [draft({ id: 'a' }), draft({ id: 'b' }), draft({ id: 'c' })]

    const result = reconcileDrafts(drafts, [
      { id: 'a', status: 'published' },
      { id: 'b', status: 'rejected', rejectionReason: 'unsafe' },
      { id: 'c', status: 'checking' },
    ])

    expect(result.published.map((d) => d.id)).toEqual(['a'])
    expect(result.rejected).toEqual([
      expect.objectContaining({
        id: 'b',
        status: 'rejected',
        rejectionReason: 'unsafe',
      }),
    ])
  })

  it('ignores drafts that are already final or missing from the response', () => {
    const result = reconcileDrafts(
      [draft({ id: 'a', status: 'rejected' }), draft({ id: 'b' })],
      [{ id: 'a', status: 'rejected' }]
    )

    expect(result).toEqual({ published: [], rejected: [] })
  })
})

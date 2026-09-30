import {
  MOCK_REVIEW_DELAY_MS,
  createMockSubmission,
  findExistingWebsiteId,
  getMockSubmittedWebsite,
  mockVerification,
  resetMockSubmissions,
} from './submissions'
import type { IWebsiteSubmission } from '@/interfaces/IWebsite'

const SUBMITTED_AT = Date.parse('2026-09-30T12:00:00.000Z')

const submission: IWebsiteSubmission = {
  url: 'https://novo-projeto.org',
  name: 'Novo projeto',
  description: 'Um projeto novo.',
  categories: ['educacao'],
}

beforeEach(resetMockSubmissions)

describe('mock submission review', () => {
  it('starts as checking', () => {
    const created = createMockSubmission(submission, SUBMITTED_AT)

    expect(created).toMatchObject({ status: 'checking', shortCode: null })
    expect(
      getMockSubmittedWebsite(created.id, SUBMITTED_AT + 1000)?.status
    ).toBe('checking')
  })

  it('is published once the review delay has passed', () => {
    const { id } = createMockSubmission(submission, SUBMITTED_AT)
    const reviewed = getMockSubmittedWebsite(
      id,
      SUBMITTED_AT + MOCK_REVIEW_DELAY_MS
    )

    expect(reviewed).toMatchObject({ status: 'published', shortCode: id })
    expect(reviewed?.publishedAt).not.toBeNull()
  })

  it('rejects URLs with the rejection marker as unsafe', () => {
    const { id } = createMockSubmission(
      { ...submission, url: 'https://site-rejeitado.org' },
      SUBMITTED_AT
    )

    expect(
      getMockSubmittedWebsite(id, SUBMITTED_AT + MOCK_REVIEW_DELAY_MS)
    ).toMatchObject({ status: 'rejected', rejectionReason: 'unsafe' })
  })

  it('finds duplicates among published websites and submissions', () => {
    expect(findExistingWebsiteId('http://www.queridodiario.ok.org.br/')).toBe(
      '1'
    )

    const { id } = createMockSubmission(submission, SUBMITTED_AT)
    expect(findExistingWebsiteId('novo-projeto.org')).toBe(id)
    expect(findExistingWebsiteId('outro.org')).toBeUndefined()
  })

  it('returns published mock websites by id', () => {
    expect(getMockSubmittedWebsite('1')).toMatchObject({
      status: 'published',
      categories: ['cidades'],
    })
    expect(getMockSubmittedWebsite('nao-existe')).toBeUndefined()
  })
})

describe('mockVerification', () => {
  it('verifies ids ending in an even character code', () => {
    expect(mockVerification('4', SUBMITTED_AT)).toEqual({
      verified: true,
      verifiedAt: new Date(SUBMITTED_AT).toISOString(),
    })
    expect(mockVerification('5')).toEqual({
      verified: false,
      verifiedAt: null,
      reason: 'widget_not_found',
    })
  })
})

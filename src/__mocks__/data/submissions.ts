import { MOCK_WEBSITES } from '@/__mocks__/data/websites'
import type {
  IVerificationResult,
  IWebsite,
  IWebsitePreview,
  IWebsiteSubmission,
  ISubmittedWebsite,
} from '@/interfaces/IWebsite'
import { normalizeUrl } from '@/utils/normalizeUrl/normalizeUrl'

export const MOCK_REVIEW_DELAY_MS = 5000
export const REJECTED_URL_MARKER = 'rejeitado'
export const UNREACHABLE_URL_MARKER = 'inacessivel'

type StoredSubmission = Omit<
  ISubmittedWebsite,
  'status' | 'rejectionReason' | 'publishedAt' | 'shortCode'
>

const submissions = new Map<string, StoredSubmission>()
let submissionCount = 0

export function resetMockSubmissions() {
  submissions.clear()
  submissionCount = 0
}

function fromPublishedWebsite(website: IWebsite): ISubmittedWebsite {
  return {
    id: website.id,
    url: website.url,
    shortCode: website.id,
    name: website.name,
    description: website.description,
    color: website.color ?? null,
    faviconUrl: website.faviconUrl || null,
    repo: website.repo,
    categories: website.keywords.map((keyword) => keyword.name),
    status: 'published',
    verifiedAt: website.verifiedAt ?? null,
    submittedAt: website.createdAt,
    publishedAt: website.createdAt,
  }
}

function resolveReview(
  submission: StoredSubmission,
  now: number
): ISubmittedWebsite {
  const reviewedAt = Date.parse(submission.submittedAt) + MOCK_REVIEW_DELAY_MS

  if (now < reviewedAt) {
    return {
      ...submission,
      status: 'checking',
      shortCode: null,
      publishedAt: null,
    }
  }

  if (submission.url.includes(REJECTED_URL_MARKER)) {
    return {
      ...submission,
      status: 'rejected',
      rejectionReason: 'unsafe',
      shortCode: null,
      publishedAt: null,
    }
  }

  return {
    ...submission,
    status: 'published',
    shortCode: submission.id,
    publishedAt: new Date(reviewedAt).toISOString(),
  }
}

export function findExistingWebsiteId(url: string): string | undefined {
  const key = normalizeUrl(url)
  if (!key) return undefined

  const published = MOCK_WEBSITES.find(
    (website) => normalizeUrl(website.url) === key
  )
  if (published) return published.id

  return [...submissions.values()].find(
    (submission) => normalizeUrl(submission.url) === key
  )?.id
}

export function createMockSubmission(
  submission: IWebsiteSubmission,
  now = Date.now()
): ISubmittedWebsite {
  submissionCount += 1
  const stored: StoredSubmission = {
    id: `sub-${now.toString(36)}-${submissionCount}`,
    url: submission.url,
    name: submission.name,
    description: submission.description,
    color: submission.color ?? null,
    faviconUrl: submission.faviconUrl ?? null,
    repo: submission.repo,
    categories: submission.categories,
    verifiedAt: null,
    submittedAt: new Date(now).toISOString(),
  }
  submissions.set(stored.id, stored)

  return resolveReview(stored, now)
}

export function getMockSubmittedWebsite(
  id: string,
  now = Date.now()
): ISubmittedWebsite | undefined {
  const submission = submissions.get(id)
  if (submission) return resolveReview(submission, now)

  const published = MOCK_WEBSITES.find((website) => website.id === id)
  return published && fromPublishedWebsite(published)
}

export function mockPreview(url: string): IWebsitePreview | null {
  if (url.includes(UNREACHABLE_URL_MARKER)) return null

  const { hostname, origin } = new URL(url)
  const siteName = hostname.replace(/^www\./, '').split('.')[0]

  return {
    url,
    name: siteName.charAt(0).toUpperCase() + siteName.slice(1),
    description: `Projeto independente publicado em ${hostname}.`,
    color: '#4A90E2',
    faviconUrl: `${origin}/favicon.ico`,
  }
}

export function mockVerification(
  id: string,
  now = Date.now()
): IVerificationResult {
  const hasWidget = id.charCodeAt(id.length - 1) % 2 === 0

  return hasWidget
    ? { verified: true, verifiedAt: new Date(now).toISOString() }
    : { verified: false, verifiedAt: null, reason: 'widget_not_found' }
}

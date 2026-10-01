import type {
  ISubmittedWebsite,
  IWebsite,
  IWebsiteStatus,
  WebsiteRejectionReason,
  WebsiteStatus,
} from '@/interfaces/IWebsite'

export const PENDING_SUBMISSIONS_KEY = 'nnc-pending-submissions'
export const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000
export const ACTIVE_CHECK_WINDOW_MS = 2 * 60 * 1000
export const ACTIVE_CHECK_INTERVAL_MS = 15 * 1000
export const RETURN_CHECK_MIN_INTERVAL_MS = 60 * 1000

export interface IPendingSubmission {
  id: string
  url: string
  name: string
  description: string
  color: string | null
  faviconUrl: string | null
  categories: string[]
  status: WebsiteStatus
  rejectionReason?: WebsiteRejectionReason
  submittedAt: string
}

export const NO_PENDING_SUBMISSIONS: IPendingSubmission[] = []

function isPendingSubmission(value: unknown): value is IPendingSubmission {
  if (typeof value !== 'object' || value === null) return false
  const draft = value as Record<string, unknown>

  return (
    typeof draft.id === 'string' &&
    typeof draft.url === 'string' &&
    typeof draft.name === 'string' &&
    typeof draft.submittedAt === 'string' &&
    Array.isArray(draft.categories) &&
    (draft.status === 'checking' || draft.status === 'rejected')
  )
}

export function isPendingSubmissionList(
  value: unknown
): value is IPendingSubmission[] {
  return Array.isArray(value) && value.every(isPendingSubmission)
}

export function toPendingSubmission(
  website: ISubmittedWebsite
): IPendingSubmission {
  return {
    id: website.id,
    url: website.url,
    name: website.name,
    description: website.description,
    color: website.color,
    faviconUrl: website.faviconUrl,
    categories: website.categories,
    status: website.status,
    rejectionReason: website.rejectionReason,
    submittedAt: website.submittedAt,
  }
}

export function isExpired(draft: IPendingSubmission, now: number) {
  return now - Date.parse(draft.submittedAt) >= DRAFT_TTL_MS
}

export function isInActiveCheckWindow(draft: IPendingSubmission, now: number) {
  return (
    draft.status === 'checking' &&
    now - Date.parse(draft.submittedAt) < ACTIVE_CHECK_WINDOW_MS
  )
}

export function draftToWebsite(draft: IPendingSubmission): IWebsite {
  return {
    id: draft.id,
    name: draft.name,
    description: draft.description,
    url: draft.url,
    color: draft.color ?? undefined,
    faviconUrl: draft.faviconUrl ?? '',
    keywords: draft.categories.map((name) => ({ id: name, name })),
    createdAt: draft.submittedAt,
    updatedAt: draft.submittedAt,
    status: draft.status,
  }
}

export type DraftReconciliation = {
  published: IPendingSubmission[]
  rejected: IPendingSubmission[]
}

export function reconcileDrafts(
  drafts: IPendingSubmission[],
  statuses: IWebsiteStatus[]
): DraftReconciliation {
  const statusById = new Map(statuses.map((status) => [status.id, status]))
  const result: DraftReconciliation = { published: [], rejected: [] }

  for (const draft of drafts) {
    const latest = statusById.get(draft.id)
    if (!latest || draft.status !== 'checking') continue

    if (latest.status === 'published') result.published.push(draft)
    if (latest.status === 'rejected') {
      result.rejected.push({
        ...draft,
        status: 'rejected',
        rejectionReason: latest.rejectionReason ?? 'error',
      })
    }
  }

  return result
}

const REJECTION_MESSAGES: Record<WebsiteRejectionReason, string> = {
  unsafe: 'Conteúdo não permitido',
  unreachable: 'Site inacessível',
  error: 'Não foi possível verificar',
}

export function rejectionMessage(reason: WebsiteRejectionReason | undefined) {
  return REJECTION_MESSAGES[reason ?? 'error']
}

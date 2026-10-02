import { useCallback, useMemo, useState } from 'react'
import { useLocalStorageJson } from '@/hooks/useLocalStorageJson'
import type { ISubmittedWebsite } from '@/interfaces/IWebsite'
import {
  NO_PENDING_SUBMISSIONS,
  PENDING_SUBMISSIONS_KEY,
  isExpired,
  isPendingSubmissionList,
  toPendingSubmission,
  type IPendingSubmission,
} from '@/pages/SubmitWebsite/utils/pendingSubmissions'

export function usePendingSubmissions() {
  const [stored, setStored] = useLocalStorageJson(
    PENDING_SUBMISSIONS_KEY,
    NO_PENDING_SUBMISSIONS,
    isPendingSubmissionList
  )

  const [openedAt] = useState(Date.now)
  const drafts = useMemo(
    () => stored.filter((draft) => !isExpired(draft, openedAt)),
    [stored, openedAt]
  )

  const addDraft = useCallback(
    (website: ISubmittedWebsite) =>
      setStored((current) => [
        toPendingSubmission(website),
        ...current.filter(
          (draft) => draft.id !== website.id && !isExpired(draft, Date.now())
        ),
      ]),
    [setStored]
  )

  const updateDrafts = useCallback(
    (updated: IPendingSubmission[]) => {
      const byId = new Map(updated.map((draft) => [draft.id, draft]))
      setStored((current) =>
        current.map((draft) => byId.get(draft.id) ?? draft)
      )
    },
    [setStored]
  )

  const removeDrafts = useCallback(
    (ids: string[]) =>
      setStored((current) =>
        current.filter((draft) => !ids.includes(draft.id))
      ),
    [setStored]
  )

  return { drafts, addDraft, updateDrafts, removeDrafts }
}

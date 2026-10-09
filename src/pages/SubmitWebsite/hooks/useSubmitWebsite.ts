import { useMutation, useQueryClient } from '@tanstack/react-query'
import { v1Api } from '@/api/api'
import { turnstileHeaders } from '@/api/turnstile'
import { usePendingSubmissions } from '@/pages/SubmitWebsite/hooks/usePendingSubmissions'
import { usePublishedThisSession } from '@/pages/SubmitWebsite/hooks/usePublishedThisSession'
import {
  draftToWebsite,
  toPendingSubmission,
} from '@/pages/SubmitWebsite/utils/pendingSubmissions'
import type { IApiError } from '@/interfaces/IApiError'
import type {
  ISubmittedWebsite,
  IWebsiteSubmission,
} from '@/interfaces/IWebsite'

type SubmitWebsiteInput = {
  submission: IWebsiteSubmission
  turnstileToken: string | null
}

export function useSubmitWebsite() {
  const { addDraft } = usePendingSubmissions()
  const { addPublished } = usePublishedThisSession()
  const queryClient = useQueryClient()

  return useMutation<ISubmittedWebsite, IApiError, SubmitWebsiteInput>({
    mutationFn: ({ submission, turnstileToken }) =>
      v1Api
        .post<ISubmittedWebsite>('websites', submission, {
          headers: turnstileHeaders(turnstileToken),
        })
        .then((res) => res.data),
    onSuccess: (website) => {
      if (website.status === 'checking') return addDraft(website)
      if (website.status === 'published') {
        addPublished([draftToWebsite(toPendingSubmission(website))])
      }
      queryClient.invalidateQueries({ queryKey: ['websites'] })
    },
  })
}

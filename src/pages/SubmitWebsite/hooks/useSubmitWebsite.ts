import { useMutation, useQueryClient } from '@tanstack/react-query'
import { v1Api } from '@/api/api'
import { usePendingSubmissions } from '@/pages/SubmitWebsite/hooks/usePendingSubmissions'
import type { IApiError } from '@/interfaces/IApiError'
import type {
  ISubmittedWebsite,
  IWebsiteSubmission,
} from '@/interfaces/IWebsite'

export const TURNSTILE_HEADER = 'cf-turnstile-response'

type SubmitWebsiteInput = {
  submission: IWebsiteSubmission
  turnstileToken: string | null
}

export function useSubmitWebsite() {
  const { addDraft } = usePendingSubmissions()
  const queryClient = useQueryClient()

  return useMutation<ISubmittedWebsite, IApiError, SubmitWebsiteInput>({
    mutationFn: ({ submission, turnstileToken }) =>
      v1Api
        .post<ISubmittedWebsite>('websites', submission, {
          headers: turnstileToken
            ? { [TURNSTILE_HEADER]: turnstileToken }
            : undefined,
        })
        .then((res) => res.data),
    onSuccess: (website) => {
      if (website.status === 'checking') return addDraft(website)
      queryClient.invalidateQueries({ queryKey: ['websites'] })
    },
  })
}

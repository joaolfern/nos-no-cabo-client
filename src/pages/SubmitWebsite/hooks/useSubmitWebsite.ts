import { useMutation } from '@tanstack/react-query'
import { api } from '@/api/api'
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

  return useMutation<ISubmittedWebsite, IApiError, SubmitWebsiteInput>({
    mutationFn: ({ submission, turnstileToken }) =>
      api
        .post<ISubmittedWebsite>('v1/websites', submission, {
          headers: turnstileToken
            ? { [TURNSTILE_HEADER]: turnstileToken }
            : undefined,
        })
        .then((res) => res.data),
    onSuccess: addDraft,
  })
}

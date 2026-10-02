import { useMutation } from '@tanstack/react-query'
import { v1Api } from '@/api/api'
import { turnstileHeaders } from '@/api/turnstile'
import type { IApiError } from '@/interfaces/IApiError'
import type { IReportSubmission } from '@/interfaces/IReport'

type ReportWebsiteInput = {
  report: IReportSubmission
  turnstileToken: string | null
}

export function useReportWebsite(websiteId: string) {
  return useMutation<void, IApiError, ReportWebsiteInput>({
    mutationFn: ({ report, turnstileToken }) =>
      v1Api
        .post(`websites/${websiteId}/reports`, report, {
          headers: turnstileHeaders(turnstileToken),
        })
        .then(() => undefined),
  })
}

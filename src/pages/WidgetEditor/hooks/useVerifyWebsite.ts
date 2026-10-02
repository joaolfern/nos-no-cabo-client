import { useMutation, useQueryClient } from '@tanstack/react-query'
import { v1Api } from '@/api/api'
import type { IApiError } from '@/interfaces/IApiError'
import type { IVerificationResult } from '@/interfaces/IWebsite'

export function useVerifyWebsite(websiteId: string) {
  const queryClient = useQueryClient()

  return useMutation<IVerificationResult, IApiError>({
    mutationFn: () =>
      v1Api
        .post<IVerificationResult>(`websites/${websiteId}/verify`)
        .then((res) => res.data),
    onSuccess: ({ verified }) => {
      if (!verified) return
      queryClient.invalidateQueries({ queryKey: ['websites'] })
    },
  })
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/api'
import type { IApiError } from '@/interfaces/IApiError'
import type { IVerificationResult } from '@/interfaces/IWebsite'

export function useVerifyWebsite(websiteId: string) {
  const queryClient = useQueryClient()

  return useMutation<IVerificationResult, IApiError>({
    mutationFn: () =>
      api
        .post<IVerificationResult>(`v1/websites/${websiteId}/verify`)
        .then((res) => res.data),
    onSuccess: ({ verified }) => {
      if (!verified) return
      queryClient.invalidateQueries({ queryKey: ['websites'] })
      queryClient.invalidateQueries({
        queryKey: [{ type: 'websiteDetails', id: websiteId }],
      })
    },
  })
}

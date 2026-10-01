import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/api'
import type { IApiError } from '@/interfaces/IApiError'
import type { ISubmittedWebsite } from '@/interfaces/IWebsite'

export function useSubmittedWebsite(id: string) {
  return useQuery<ISubmittedWebsite, IApiError>({
    queryKey: ['submittedWebsite', id],
    queryFn: () =>
      api.get<ISubmittedWebsite>(`v1/websites/${id}`).then((res) => res.data),
    retry: false,
  })
}

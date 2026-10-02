import { useQuery } from '@tanstack/react-query'
import { v1Api } from '@/api/api'
import type { IApiError } from '@/interfaces/IApiError'
import type { ISubmittedWebsite } from '@/interfaces/IWebsite'

export function useSubmittedWebsite(id: string) {
  return useQuery<ISubmittedWebsite, IApiError>({
    queryKey: ['submittedWebsite', id],
    queryFn: () =>
      v1Api.get<ISubmittedWebsite>(`websites/${id}`).then((res) => res.data),
    retry: false,
  })
}

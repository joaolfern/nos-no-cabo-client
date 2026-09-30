import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/api'
import { useDebounce } from '@/hooks/useDebounce'
import type { IApiError } from '@/interfaces/IApiError'
import type { IWebsitePreview } from '@/interfaces/IWebsite'
import { normalizeUrl, toAbsoluteUrl } from '@/utils/normalizeUrl/normalizeUrl'

export const PREVIEW_DEBOUNCE_MS = 400

export function useWebsitePreview(url: string) {
  const debouncedUrl = useDebounce(url, PREVIEW_DEBOUNCE_MS)
  const absoluteUrl = toAbsoluteUrl(debouncedUrl)

  return useQuery<IWebsitePreview, IApiError>({
    queryKey: ['websitePreview', absoluteUrl && normalizeUrl(absoluteUrl)],
    queryFn: () =>
      api
        .get<IWebsitePreview>('v1/websites/preview', {
          params: { url: absoluteUrl },
        })
        .then((res) => res.data),
    enabled: absoluteUrl !== null,
    staleTime: Infinity,
    retry: false,
  })
}

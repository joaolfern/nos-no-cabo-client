import { useQuery } from '@tanstack/react-query'
import { websitePageQuery } from '@/hooks/useDataHooks'

export function useWebsiteStats(id: string) {
  return useQuery({ ...websitePageQuery(id), select: (page) => page.stats })
}

import { useMemo } from 'react'
import type { IWebsite } from '@/interfaces/IWebsite'
import { buildMockWebsiteMetrics } from '@/pages/Website/utils/mockWebsiteMetrics/mockWebsiteMetrics'

export function useWebsiteMetrics(website: IWebsite) {
  return useMemo(() => buildMockWebsiteMetrics(website), [website])
}

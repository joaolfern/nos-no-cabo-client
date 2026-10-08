import type { IWebsite } from '@/interfaces/IWebsite'

export const RECOMMENDED_SITES_LIMIT = 6

export function getRecommendedWebsites(
  websites: IWebsite[],
  currentWebsiteId: string
): IWebsite[] {
  const result: IWebsite[] = []
  for (const website of websites) {
    if (website.id !== currentWebsiteId) {
      result.push(website)
      if (result.length === RECOMMENDED_SITES_LIMIT) break
    }
  }
  return result
}

import { RING_BASE_URL } from '@/config/env'
import type { IWebsite } from '@/interfaces/IWebsite'

// The router counts the click (ADR 0006) and redirects to the site.
export function visitUrl(website: Pick<IWebsite, 'url' | 'shortCode'>) {
  return website.shortCode
    ? `${RING_BASE_URL}/r/${website.shortCode}`
    : website.url
}

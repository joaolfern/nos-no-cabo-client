import type { Website } from '@nosnocabo/contract'
import type { IWebsite } from '@/interfaces/IWebsite'

// The cards and the website page still use IWebsite; categories become keywords by slug.
export function fromApiWebsite(website: Website): IWebsite {
  const date = website.publishedAt ?? website.submittedAt

  return {
    id: website.id,
    name: website.name,
    description: website.description,
    url: website.url,
    color: website.color ?? undefined,
    faviconUrl: website.faviconUrl ?? '',
    repo: website.repo,
    keywords: website.categories.map((slug) => ({ id: slug, name: slug })),
    createdAt: date,
    updatedAt: date,
    status: website.status,
    verifiedAt: website.verifiedAt,
  }
}

import type { IKeyword, IWebsite } from '@/interfaces/IWebsite'

export function getPrimaryKeyword(
  website: IWebsite,
  highlightKeywordId?: string
): IKeyword | undefined {
  return (
    website.keywords.find((keyword) => keyword.id === highlightKeywordId) ??
    website.keywords[0]
  )
}

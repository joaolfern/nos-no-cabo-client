import type { IWebsite } from '@/interfaces/IWebsite'
import type { _sortType } from '@/interfaces/ISort'

export function sortWebsites(
  websites: IWebsite[],
  sortType: _sortType
): IWebsite[] {
  const websitesCopy = [...websites]
  switch (sortType) {
    case 'date_asc':
      return websitesCopy.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    case 'date_desc':
      return websitesCopy.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    case 'title_asc':
      return websitesCopy.sort((a, b) => a.name.localeCompare(b.name))
    case 'title_desc':
      return websitesCopy.sort((a, b) => b.name.localeCompare(a.name))
    default:
      return websitesCopy
  }
}

import type { IQueryEventValues } from '@/interfaces/ICustomEvents'

export function storeInUrl(url: URL, query: IQueryEventValues['query']) {
  for (const key in query) {
    const value = query[key]
    if (value) {
      url.searchParams.set(key, value)
    } else {
      url.searchParams.delete(key)
    }
  }

  window.history.pushState({}, '', url)

  return url
}

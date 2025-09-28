import type { IQueryEventValues } from '@/interfaces/ICustomEvents'

export function handleNavigate(url: URL, query: IQueryEventValues['query']) {
  for (const key in query) {
    const value = query[key]
    if (value) {
      url.searchParams.set(key, value)
    } else {
      url.searchParams.delete(key)
    }
  }

  const detail: IQueryEventValues = { query }

  window.dispatchEvent(new CustomEvent('query-change', { detail }))
  window.history.pushState({}, '', url)
}

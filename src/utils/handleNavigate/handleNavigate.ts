import type { IQueryEventValues } from '@/interfaces/ICustomEvents'
import { storeInUrl } from '@/utils/storeInUrl/storeInUrl'

export function handleNavigate(url: URL, query: IQueryEventValues['query']) {
  storeInUrl(url, query)
  const detail: IQueryEventValues = { query }

  window.dispatchEvent(new CustomEvent('query-change', { detail }))
}

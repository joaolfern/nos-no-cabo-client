import type { IQueryEvent } from '@/interfaces/ICustomEvents'
import { useEffect, useMemo, useState } from 'react'

export function useUrlQuery(...args: string[]) {
  const query = useMemo(() => new URLSearchParams(window.location.search), [])
  const [queryResult, setQueryResult] = useState<Record<string, string | null>>(
    () => getQueryValues(query, args)
  )

  useEffect(() => {
    const updateQueryResult = (e: Event) => {
      const queryValues = (e as IQueryEvent).detail.query

      setQueryResult(queryValues)
    }

    const handlePopState = () => {
      const query = new URLSearchParams(window.location.search)
      setQueryResult(getQueryValues(query, args))
    }

    window.addEventListener('popstate', handlePopState)

    window.addEventListener('query-change', updateQueryResult)

    return () => {
      window.removeEventListener('query-change', updateQueryResult)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [args])

  return queryResult
}

function getQueryValues(query: URLSearchParams, keys: string[]) {
  const result: Record<string, string | null> = {}
  keys.forEach((key) => {
    result[key] = query.get(key)
  })
  return result
}

import { useCallback, useMemo, type ReactNode } from 'react'
import type { IWebsite, IWebsitesContext } from '@/interfaces/IWebsite'
import { useWebsitesData } from '@/hooks/useDataHooks'
import { WebsitesContext } from '@/contexts/WebsitesContext'
import { sortWebsites } from '@/pages/Feed/utils/sortWebsites'
import { useSort } from '@/pages/Feed/hooks/useSort'
import { useFilters } from '@/pages/Feed/hooks/useFilters'

type WebsitesProviderProps = {
  children: ReactNode
}

export function WebsitesProvider({ children }: WebsitesProviderProps) {
  const { data: websitesRaw, isLoading, error } = useWebsitesData()
  const { selectedSort } = useSort()
  const { filterByKeyword, selectedKeywords } = useFilters()

  const websites = useMemo(() => {
    const filtered = filterByKeyword(websitesRaw ?? [], selectedKeywords)

    return sortWebsites(filtered, selectedSort)
  }, [websitesRaw, selectedKeywords, selectedSort, filterByKeyword])

  const websitesIdMap = useMemo(() => {
    const map = new Map<string, IWebsite>()
    websitesRaw?.forEach((website) => map.set(website.id, website))
    return map
  }, [websitesRaw])

  const getWebsiteById = useCallback(
    (id: string): IWebsite => websitesIdMap.get(id) as IWebsite,
    [websitesIdMap]
  )

  const value = useMemo<IWebsitesContext>(
    (): IWebsitesContext => ({
      websites,
      isLoading,
      error,
      getWebsiteById,
      websitesRaw,
    }),
    [websites, isLoading, getWebsiteById, error, websitesRaw]
  )

  return (
    <WebsitesContext.Provider value={value}>
      {children}
    </WebsitesContext.Provider>
  )
}

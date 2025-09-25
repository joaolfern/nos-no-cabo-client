import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { IWebsite, IWebsitesContext } from '@/interfaces/IWebsite'
import { useWebsitesData } from '@/hooks/useDataHooks'
import { WebsitesContext } from '@/contexts/WebsitesContext'
import { sortWebsites } from '@/pages/Feed/utils/sortWebsites'
import { useSort } from '@/pages/Feed/hooks/useSort'

type WebsitesProviderProps = {
  children: ReactNode
}

export function WebsitesProvider({ children }: WebsitesProviderProps) {
  const { data: websitesRaw, isLoading, error } = useWebsitesData()
  const [websites, setWebsites] = useState<IWebsite[]>(websitesRaw ?? [])
  const { selectedSort } = useSort()

  const websitesSorted = useMemo(() => {
    if (!websites) return []

    const result = sortWebsites(websites, selectedSort)

    return result
  }, [websites, selectedSort])

  const websitesIdMap = useMemo(() => {
    const map = new Map<string, IWebsite>()
    websites?.forEach((website) => map.set(website.id, website))
    return map
  }, [websites])

  const getWebsiteById = useCallback(
    (id: string): IWebsite => {
      const targetMap = websitesIdMap
      return targetMap.get(id) as IWebsite
    },
    [websitesIdMap]
  )

  const updateWebsites = useCallback((websites: IWebsite[]) => {
    setWebsites(websites)
  }, [])

  useEffect(() => {
    if (websitesRaw) {
      updateWebsites(websitesRaw)
    }
  }, [websitesRaw, updateWebsites])

  const value = useMemo<IWebsitesContext>(
    (): IWebsitesContext => ({
      websites: websitesSorted,
      isLoading,
      error,
      getWebsiteById,
      updateWebsites,
      websitesRaw,
    }),
    [
      websitesSorted,
      isLoading,
      getWebsiteById,
      error,
      updateWebsites,
      websitesRaw,
    ]
  )

  return (
    <WebsitesContext.Provider value={value}>
      {children}
    </WebsitesContext.Provider>
  )
}

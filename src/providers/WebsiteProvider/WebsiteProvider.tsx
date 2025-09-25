import { WebsiteDetailsContext } from '@/contexts/WebsiteDetailsContext'
import { useWebsiteDetailsData } from '@/hooks/useDataHooks'
import type { IWebsiteDetailsContext } from '@/interfaces/IWebsiteDetails'
import { useWebsites } from '@/pages/Feed/hooks/useWebsites'
import { useMemo } from 'react'

type WebsiteProviderProps = {
  children: React.ReactNode
  id: string
}

export function WebsiteDetailsProvider({ children, id }: WebsiteProviderProps) {
  const {
    data: websiteRaw,
    error,
    isLoading: isLoadingRaw,
  } = useWebsiteDetailsData(id)
  const { getWebsiteById } = useWebsites()

  const feedData = useMemo(() => {
    return getWebsiteById(id)
  }, [getWebsiteById, id])

  const isLoading = isLoadingRaw && !feedData

  const website = useMemo<IWebsiteDetailsContext['website']>(
    () => ({
      ...feedData,
      id,
      ...websiteRaw,
    }),
    [websiteRaw, feedData, id]
  )

  const value = useMemo<IWebsiteDetailsContext>(
    () => ({
      website,
      error,
      isLoading,
    }),
    [website, error, isLoading]
  )

  return (
    <WebsiteDetailsContext.Provider value={value}>
      {children}
    </WebsiteDetailsContext.Provider>
  )
}

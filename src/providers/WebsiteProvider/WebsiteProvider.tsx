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

  // A site already loaded in the feed renders at once; the server copy replaces it.
  const feedData = useMemo(() => getWebsiteById(id), [getWebsiteById, id])
  const website = websiteRaw ?? feedData ?? null
  const isLoading = isLoadingRaw && !feedData

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

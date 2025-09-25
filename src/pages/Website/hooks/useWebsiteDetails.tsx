import { useContext } from 'react'
import { WebsiteDetailsContext } from '@/contexts/WebsiteDetailsContext'

export const useWebsiteDetails = () => {
  const context = useContext(WebsiteDetailsContext)
  if (!context) {
    throw new Error(
      'useWebsiteDetails must be used within a WebsiteDetailsProvider'
    )
  }
  return context
}

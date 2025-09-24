import { useContext } from 'react'
import { WebsitesContext } from '@/contexts/WebsitesContext'

export const useWebsites = () => {
  const context = useContext(WebsitesContext)
  if (!context) {
    throw new Error('useWebsites must be used within a WebsitesProvider')
  }
  return context
}

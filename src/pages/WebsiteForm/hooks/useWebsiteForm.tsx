import { useContext } from 'react'
import { WebsiteFormContext } from '../contexts/WebsiteFormContext/WebsiteFormContext'

export const useWebsiteForm = () => useContext(WebsiteFormContext)

import React from 'react'
import type { IWebsite, IWebsitesContext } from '@/interfaces/IWebsite'

const INITIAL_STATE: IWebsitesContext = {
  websites: [],
  getWebsiteById: () => ({}) as IWebsite,
  isLoading: false,
  error: null,
  websitesRaw: undefined,
}

export const WebsitesContext =
  React.createContext<IWebsitesContext>(INITIAL_STATE)

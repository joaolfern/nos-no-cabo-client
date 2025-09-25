import React from 'react'
import type { IWebsiteDetailsContext } from '@/interfaces/IWebsiteDetails'

const INITIAL_STATE: IWebsiteDetailsContext = {
  website: null,
  isLoading: false,
  error: null,
}

export const WebsiteDetailsContext =
  React.createContext<IWebsiteDetailsContext>(INITIAL_STATE)

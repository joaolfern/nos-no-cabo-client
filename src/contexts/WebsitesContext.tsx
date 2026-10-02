import React from 'react'
import { FEED_PAGE_SIZE } from '@/constants/post'
import type { IWebsitesContext } from '@/interfaces/IWebsite'

const INITIAL_STATE: IWebsitesContext = {
  websites: [],
  total: undefined,
  isLoading: false,
  error: null,
  hasMore: false,
  isLoadingMore: false,
  loadMore: () => {},
  pageSize: FEED_PAGE_SIZE,
  getWebsiteById: () => undefined,
}

export const WebsitesContext =
  React.createContext<IWebsitesContext>(INITIAL_STATE)

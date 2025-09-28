import type { IAuthor } from '@/interfaces/IAuthor'

export interface IWebsite {
  id: string
  name: string
  description: string
  url: string
  color: string | undefined
  keywords: IKeyword[]
  createdAt: string
  updatedAt: string
  faviconUrl: string
  repo?: string
  author?: IAuthor
}

export interface IWebsitesContext {
  websites: IWebsite[]
  isLoading: boolean
  error: Error | null
  getWebsiteById: (id: string) => IWebsite
  updateWebsites: (newWebsites: IWebsite[]) => void
  websitesRaw: IWebsite[] | undefined
}

export interface IKeyword {
  id: string
  name: string
}

export type IPreregisterWebsite = Pick<
  IWebsite,
  'id' | 'url' | 'description' | 'name' | 'faviconUrl' | 'color' | 'repo'
>

export type IRegisterWebsite = IPreregisterWebsite & {
  keywords: string[]
}

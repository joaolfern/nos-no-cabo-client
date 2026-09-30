import type { IAuthor } from '@/interfaces/IAuthor'

export type WebsiteStatus = 'checking' | 'published' | 'rejected'

export type WebsiteRejectionReason = 'unsafe' | 'unreachable' | 'error'

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
  status?: WebsiteStatus
  verifiedAt?: string | null
}

export interface IWebsitePreview {
  url: string
  name: string | null
  description: string | null
  color: string | null
  faviconUrl: string | null
}

export interface IWebsiteSubmission {
  url: string
  name: string
  description: string
  color?: string
  faviconUrl?: string
  repo?: string
  categories: string[]
}

export interface ISubmittedWebsite {
  id: string
  url: string
  shortCode: string | null
  name: string
  description: string
  color: string | null
  faviconUrl: string | null
  repo?: string
  categories: string[]
  status: WebsiteStatus
  rejectionReason?: WebsiteRejectionReason
  verifiedAt: string | null
  submittedAt: string
  publishedAt: string | null
}

export interface IVerificationResult {
  verified: boolean
  verifiedAt: string | null
  reason?: 'widget_not_found' | 'unreachable'
}

export interface IWebsitesContext {
  websites: IWebsite[]
  isLoading: boolean
  error: Error | null
  getWebsiteById: (id: string) => IWebsite
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

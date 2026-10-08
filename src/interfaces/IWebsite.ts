import type { IAuthor } from '@/interfaces/IAuthor'

import type {
  RejectionReason,
  VerificationResult,
  Website,
  WebsitePreview,
  WebsiteStatus as ContractWebsiteStatus,
  WebsiteStatusEntry,
  WebsiteSubmission,
} from '@nosnocabo/contract'

// The /v1 shapes come from @nosnocabo/contract, published by nos-sr.
export type WebsiteStatus = ContractWebsiteStatus
export type WebsiteRejectionReason = RejectionReason
export type IWebsitePreview = WebsitePreview
export type IWebsiteSubmission = WebsiteSubmission
export type ISubmittedWebsite = Website
export type IVerificationResult = VerificationResult
export type IWebsiteStatus = WebsiteStatusEntry

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
  shortCode?: string | null
  likes?: number
}

export interface IKeyword {
  id: string
  name: string
}

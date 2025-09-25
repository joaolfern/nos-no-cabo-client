import type { IWebsite } from '@/interfaces/IWebsite'

export type IWebsiteDetailsContext = {
  website: IWebsite | null
  isLoading: boolean
  error: Error | null
}

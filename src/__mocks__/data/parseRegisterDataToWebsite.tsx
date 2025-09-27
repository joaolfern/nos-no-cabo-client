import type { IRegisterWebsite, IWebsite } from '@/interfaces/IWebsite'

export function parseRegisterDataToWebsite(
  newWebsite: IRegisterWebsite
): IWebsite {
  return {
    ...newWebsite,
    keywords: newWebsite.keywords.map((k, index) => ({
      id: `temp-id-${index}`,
      name: k,
    })),
    id: 'temp-id',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

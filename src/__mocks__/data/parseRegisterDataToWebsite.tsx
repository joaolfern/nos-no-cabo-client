import type { IRegisterWebsite, IWebsite } from '@/interfaces/IWebsite'

export function parseRegisterDataToWebsite(
  newWebsite: IRegisterWebsite
): IWebsite {
  return {
    ...newWebsite,
    author: {
      id: 'temp-id',
      createdAt: new Date().toISOString(),
      name: '...',
      profilePicture: '',
      updatedAt: new Date().toISOString(),
      verified: false,
    },
    keywords: newWebsite.keywords.map((k, index) => ({
      id: `temp-id-${index}`,
      name: k,
    })),
    id: 'temp-id',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

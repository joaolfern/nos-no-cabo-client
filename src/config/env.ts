const fixURL = (url: string | undefined) => url && url.replace(/\/+$/, '')

const VITE_DEV_API_URL = fixURL(import.meta.env.VITE_DEV_API_URL)

export const API_URL = VITE_DEV_API_URL as string

if (!API_URL) {
  throw new Error('API_URL is not defined')
}

export const BOOK_COVER_QUALITY = import.meta.env.VITE_ENABLE_MOCKS ? 'S' : 'L'
export const ENABLE_OPEN_LIBRARY_API = !import.meta.env.VITE_ENABLE_MOCKS

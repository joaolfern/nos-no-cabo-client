const fixURL = (url: string | undefined) => url && url.replace(/\/+$/, '')

const VITE_DEV_API_URL = fixURL(import.meta.env.VITE_DEV_API_URL)

export const API_URL = (VITE_DEV_API_URL as string) || 'http://localhost:3000'
export const ENABLE_MOCKS = import.meta.env.VITE_ENABLE_MOCKS !== 'false'
export const BOOK_COVER_QUALITY = ENABLE_MOCKS ? 'S' : 'L'
export const ENABLE_OPEN_LIBRARY_API = !ENABLE_MOCKS
export const NOS_NO_CABO_URL =
  import.meta.env.VITE_NOS_NO_CABO_URL || 'https://nosnocabo.pages.dev'
export const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD
export const isAdminMode = Boolean(ADMIN_PASSWORD)

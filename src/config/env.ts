const fixURL = (url: string | undefined) => url && url.replace(/\/+$/, '')

const VITE_DEV_API_URL = fixURL(import.meta.env.VITE_DEV_API_URL)

export const isLocal = import.meta.env.VITE_ENV === 'local'
export const API_URL = (VITE_DEV_API_URL as string) || 'http://localhost:3000'
export const ENABLE_MOCKS = import.meta.env.VITE_ENABLE_MOCKS !== 'false'
export const BOOK_COVER_QUALITY = ENABLE_MOCKS ? 'S' : 'M'
export const ENABLE_OPEN_LIBRARY_API =
  import.meta.env.VITE_ENABLE_OPEN_LIBRARY_API !== 'false'
export const NOS_NO_CABO_URL =
  import.meta.env.VITE_NOS_NO_CABO_URL || 'https://nosnocabo.pages.dev'
export const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD
export const isAdminMode = Boolean(ADMIN_PASSWORD)
export const GITHUB_URL =
  import.meta.env.VITE_GITHUB_URL ||
  'https://github.com/joaolfern/nos-no-cabo-client'
export const TWITTER_URL = import.meta.env.VITE_TWITTER_URL as
  | string
  | undefined
export const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL as
  | string
  | undefined
const TURNSTILE_TEST_SITE_KEY = '1x00000000000000000000AA'
export const TURNSTILE_SITE_KEY: string | undefined =
  import.meta.env.VITE_TURNSTILE_SITE_KEY ||
  (ENABLE_MOCKS ? TURNSTILE_TEST_SITE_KEY : undefined)
export const RING_BASE_URL: string =
  fixURL(import.meta.env.VITE_RING_BASE_URL) || NOS_NO_CABO_URL

import '@testing-library/jest-dom/vitest'
import { server } from './src/__mocks__/node'
import { queryClient } from './src/providers/QueryProvider/queryClient'

// Mock window.matchMedia for tests
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = function (query) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: function () {},
      removeListener: function () {},
      addEventListener: function () {},
      removeEventListener: function () {},
      dispatchEvent: function () {
        return false
      },
    }
  }
}

vi.mock('@/config/env', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/config/env')>()),
  API_URL: 'https://localhost:3000',
  V1_API_URL: 'https://localhost:3000/v1',
  NOS_NO_CABO_URL: 'https://nosnocabo.pages.dev',
  RING_BASE_URL: 'https://nosnocabo.pages.dev',
  TURNSTILE_SITE_KEY: undefined,
  ENABLE_OPEN_LIBRARY_API: false,
}))

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

import '@testing-library/jest-dom'
import { server } from './src/__mocks__/node'

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

jest.mock('@/config/env', () => {
  return {
    API_URL: 'https://localhost:3000',
    NOS_NO_CABO_URL: 'https://nosnocabo.pages.dev',
    RING_BASE_URL: 'https://nosnocabo.pages.dev',
  }
})

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

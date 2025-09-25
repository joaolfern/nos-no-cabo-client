import '@testing-library/jest-dom'
import { server } from './src/__mocks__/node'

jest.mock('@/config/env', () => {
  return {
    API_URL: 'https://localhost:3000',
  }
})

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

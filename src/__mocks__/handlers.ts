import { MOCK_AUTHORS } from '@/__mocks__/data/authors'
import { MOCK_KEYWORDS } from '@/__mocks__/data/keywords'
import { MOCK_WEBSITES } from '@/__mocks__/data/websites'
import { API_URL } from '@/config/env'
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get(`${API_URL}/websites`, () => {
    return HttpResponse.json(MOCK_WEBSITES)
  }),
  http.get(`${API_URL}/authors`, () => {
    return HttpResponse.json(MOCK_AUTHORS)
  }),
  http.get(`${API_URL}/keywords`, () => {
    return HttpResponse.json(MOCK_KEYWORDS)
  }),
]

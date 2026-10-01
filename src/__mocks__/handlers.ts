import { MOCK_KEYWORDS } from '@/__mocks__/data/keywords'
import { rankWebsites } from '@/__mocks__/data/ranking'
import {
  createMockSubmission,
  findExistingWebsiteId,
  getMockStatuses,
  getMockSubmittedWebsite,
  getPublishedMockSubmissions,
  mockPreview,
  mockVerification,
} from '@/__mocks__/data/submissions'
import { MOCK_WEBSITES } from '@/__mocks__/data/websites'
import { API_URL } from '@/config/env'
import type { ApiErrorCode, IApiErrorResponse } from '@/interfaces/IApiError'
import type { IWebsite, IWebsiteSubmission } from '@/interfaces/IWebsite'
import { toAbsoluteUrl } from '@/utils/normalizeUrl/normalizeUrl'
import { http, HttpResponse } from 'msw'

const V1 = `${API_URL}/v1`

const verifiedAtById = new Map<string, string>()

function withVerification<T extends Pick<IWebsite, 'id' | 'verifiedAt'>>(
  website: T
): T {
  const verifiedAt = verifiedAtById.get(website.id)
  return verifiedAt ? { ...website, verifiedAt } : website
}

function listedWebsites() {
  return [...getPublishedMockSubmissions(), ...MOCK_WEBSITES].map(
    withVerification
  )
}

function errorResponse(
  status: number,
  code: ApiErrorCode,
  message: string,
  existingId?: string
) {
  return HttpResponse.json<IApiErrorResponse>(
    { error: { code, message, existingId } },
    { status }
  )
}

function duplicateResponse(existingId: string) {
  return errorResponse(
    409,
    'duplicate',
    'Esse site já está no Nós no Cabo.',
    existingId
  )
}

function isValidSubmission(body: IWebsiteSubmission) {
  const name = body.name?.trim() ?? ''
  const categories = body.categories ?? []

  return (
    toAbsoluteUrl(body.url ?? '') !== null &&
    name.length >= 3 &&
    name.length <= 80 &&
    (body.description ?? '').length <= 280 &&
    categories.length >= 1 &&
    categories.length <= 3
  )
}

const v1Handlers = [
  http.get(`${V1}/websites/preview`, ({ request }) => {
    const input = new URL(request.url).searchParams.get('url') ?? ''
    const url = toAbsoluteUrl(input)
    if (!url) return errorResponse(422, 'invalid', 'Endereço inválido.')

    const existingId = findExistingWebsiteId(url)
    if (existingId) return duplicateResponse(existingId)

    const preview = mockPreview(url)
    if (!preview) {
      return errorResponse(
        422,
        'unreachable',
        'Não conseguimos acessar esse endereço.'
      )
    }

    return HttpResponse.json(preview)
  }),
  http.post(`${V1}/websites`, async ({ request }) => {
    const body = (await request.json()) as IWebsiteSubmission
    if (!isValidSubmission(body)) {
      return errorResponse(422, 'invalid', 'Confira os campos do formulário.')
    }

    const existingId = findExistingWebsiteId(body.url)
    if (existingId) return duplicateResponse(existingId)

    return HttpResponse.json(createMockSubmission(body), { status: 202 })
  }),
  http.get(`${V1}/websites/status`, ({ request }) => {
    const ids = (new URL(request.url).searchParams.get('ids') ?? '')
      .split(',')
      .filter(Boolean)

    return HttpResponse.json(getMockStatuses(ids))
  }),
  http.get(`${V1}/websites/:id`, ({ params }) => {
    const website = getMockSubmittedWebsite(String(params.id))
    if (!website) return errorResponse(404, 'not_found', 'Site não encontrado.')

    return HttpResponse.json(withVerification(website))
  }),
  http.post(`${V1}/websites/:id/verify`, ({ params }) => {
    const id = String(params.id)
    if (!getMockSubmittedWebsite(id)) {
      return errorResponse(404, 'not_found', 'Site não encontrado.')
    }

    const result = mockVerification(id)
    if (result.verifiedAt) verifiedAtById.set(id, result.verifiedAt)

    return HttpResponse.json(result)
  }),
]

const legacyHandlers = [
  http.get(`${API_URL}/websites`, () => {
    return HttpResponse.json(rankWebsites(listedWebsites()))
  }),
  http.get(`${API_URL}/keywords`, () => {
    return HttpResponse.json(MOCK_KEYWORDS)
  }),
  http.delete(`${API_URL}/website/:id`, () => {
    return HttpResponse.json()
  }),
  http.get(`${API_URL}/website/:id`, ({ params }) => {
    const website = listedWebsites().find((w) => w.id === params.id)
    if (website) {
      return HttpResponse.json(website)
    }
    return HttpResponse.json({ message: 'Not found' }, { status: 404 })
  }),
]

export const handlers = [...v1Handlers, ...legacyHandlers]

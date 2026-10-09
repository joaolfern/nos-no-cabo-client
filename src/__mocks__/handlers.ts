import {
  listMockWebsites,
  markMockVerified,
  mockCategories,
  mockNeighbours,
  withMockVerification,
} from '@/__mocks__/data/catalog'
import { applyMockVote, mockStats } from '@/__mocks__/data/metrics'
import { addMockReport } from '@/__mocks__/data/reports'
import {
  createMockSubmission,
  findExistingWebsiteId,
  getMockStatuses,
  getMockSubmittedWebsite,
  mockPreview,
  mockVerification,
} from '@/__mocks__/data/submissions'
import { V1_API_URL } from '@/config/env'
import type { ApiErrorCode, IApiErrorResponse } from '@/interfaces/IApiError'
import type { IWebsiteSubmission } from '@/interfaces/IWebsite'
import { toAbsoluteUrl } from '@/utils/normalizeUrl/normalizeUrl'
import {
  ReportSubmission,
  VoteSubmission,
  WebsiteListQuery,
} from '@nosnocabo/contract'
import { http, HttpResponse } from 'msw'

const V1 = V1_API_URL

type ReadDescription = (url: string) => Promise<string | null>

// The browser worker passes a reader for the real page's meta description; tests keep the placeholder.
export function previewHandler(readDescription?: ReadDescription) {
  return http.get(`${V1}/websites/preview`, async ({ request }) => {
    const input = new URL(request.url).searchParams.get('url') ?? ''
    const url = toAbsoluteUrl(input)
    if (!url) return errorResponse(422, 'invalid', 'Endereço inválido.')

    const existingId = findExistingWebsiteId(url)
    if (existingId) return duplicateResponse(existingId)

    const description = readDescription ? await readDescription(url) : null
    const preview = mockPreview(url, description)
    if (!preview) {
      return errorResponse(
        422,
        'unreachable',
        'Não conseguimos acessar esse endereço.'
      )
    }

    return HttpResponse.json(preview)
  })
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

export const handlers = [
  http.get(`${V1}/websites`, ({ request }) => {
    const query = WebsiteListQuery.safeParse(
      Object.fromEntries(new URL(request.url).searchParams)
    )
    if (!query.success) {
      return errorResponse(422, 'invalid', 'Parâmetros de busca inválidos.')
    }

    return HttpResponse.json(listMockWebsites(query.data))
  }),
  http.get(`${V1}/categories`, () => HttpResponse.json(mockCategories())),
  http.get(`${V1}/websites/:id/neighbours`, ({ params }) => {
    const neighbours = mockNeighbours(String(params.id))
    if (!neighbours)
      return errorResponse(404, 'not_found', 'Site não encontrado.')

    return HttpResponse.json(neighbours)
  }),
  previewHandler(),
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
  http.post(`${V1}/websites/:id/subscriptions`, ({ params }) => {
    if (getMockSubmittedWebsite(String(params.id))?.status !== 'checking') {
      return errorResponse(404, 'not_found', 'Site não está em análise.')
    }

    return new HttpResponse(null, { status: 204 })
  }),
  http.post(`${V1}/websites/:id/reports`, async ({ params, request }) => {
    const id = String(params.id)
    if (getMockSubmittedWebsite(id)?.status !== 'published') {
      return errorResponse(404, 'not_found', 'Site não encontrado.')
    }

    const report = ReportSubmission.safeParse(await request.json())
    if (!report.success) {
      return errorResponse(422, 'invalid', 'Escolha um motivo para a denúncia.')
    }

    addMockReport(id, report.data)
    return new HttpResponse(null, { status: 202 })
  }),
  http.get(`${V1}/websites/:id/page`, ({ params }) => {
    const id = String(params.id)
    const website = getMockSubmittedWebsite(id)
    if (!website) return errorResponse(404, 'not_found', 'Site não encontrado.')

    return HttpResponse.json({
      website: withMockVerification(website),
      neighbours: mockNeighbours(id) ?? {
        previous: null,
        next: null,
        random: null,
      },
      stats: mockStats(id),
    })
  }),
  http.get(`${V1}/websites/:id/stats`, ({ params }) =>
    HttpResponse.json(mockStats(String(params.id)))
  ),
  http.post(`${V1}/websites/:id/votes`, async ({ params, request }) => {
    const id = String(params.id)
    if (getMockSubmittedWebsite(id)?.status !== 'published') {
      return errorResponse(404, 'not_found', 'Site não encontrado.')
    }

    const vote = VoteSubmission.safeParse(await request.json())
    if (!vote.success) return errorResponse(422, 'invalid', 'Voto inválido.')

    applyMockVote(id, vote.data.voterId, vote.data.value)
    return HttpResponse.json(mockStats(id))
  }),
  http.get(`${V1}/websites/:id`, ({ params }) => {
    const website = getMockSubmittedWebsite(String(params.id))
    if (!website) return errorResponse(404, 'not_found', 'Site não encontrado.')

    return HttpResponse.json(withMockVerification(website))
  }),
  http.post(`${V1}/websites/:id/verify`, ({ params }) => {
    const id = String(params.id)
    if (!getMockSubmittedWebsite(id)) {
      return errorResponse(404, 'not_found', 'Site não encontrado.')
    }

    const result = mockVerification(id)
    if (result.verifiedAt) markMockVerified(id, result.verifiedAt)

    return HttpResponse.json(result)
  }),
]

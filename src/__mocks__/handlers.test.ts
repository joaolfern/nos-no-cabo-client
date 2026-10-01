import { api } from '@/api/api'
import { resetMockSubmissions } from '@/__mocks__/data/submissions'
import type { IApiError } from '@/interfaces/IApiError'
import type {
  IWebsitePreview,
  IWebsiteSubmission,
  ISubmittedWebsite,
} from '@/interfaces/IWebsite'

const submission: IWebsiteSubmission = {
  url: 'https://novo-projeto.org',
  name: 'Novo projeto',
  description: 'Um projeto novo.',
  categories: ['educacao'],
}

function rejection(promise: Promise<unknown>) {
  return promise.then(
    () => {
      throw new Error('Expected the request to fail')
    },
    (error: IApiError) => error
  )
}

beforeEach(resetMockSubmissions)

describe('v1 mock handlers', () => {
  it('previews a new url', async () => {
    const { data } = await api.get<IWebsitePreview>('v1/websites/preview', {
      params: { url: 'meu-site.dev' },
    })

    expect(data).toMatchObject({
      url: 'https://meu-site.dev/',
      name: 'Meu-site',
      faviconUrl: 'https://meu-site.dev/favicon.ico',
    })
  })

  it('reports duplicates and unreachable urls with the error envelope', async () => {
    await expect(
      rejection(
        api.get('v1/websites/preview', {
          params: { url: 'queridodiario.ok.org.br' },
        })
      )
    ).resolves.toMatchObject({
      code: 'duplicate',
      existingId: '1',
      status: 409,
    })

    await expect(
      rejection(
        api.get('v1/websites/preview', {
          params: { url: 'site-inacessivel.org' },
        })
      )
    ).resolves.toMatchObject({ code: 'unreachable', status: 422 })
  })

  it('accepts a submission as checking and serves it by id', async () => {
    const created = await api.post<ISubmittedWebsite>('v1/websites', submission)

    expect(created.status).toBe(202)
    expect(created.data.status).toBe('checking')

    const { data } = await api.get<ISubmittedWebsite>(
      `v1/websites/${created.data.id}`
    )
    expect(data).toMatchObject({ id: created.data.id, status: 'checking' })
  })

  it('returns the status of several submissions in one request', async () => {
    const created = await api.post<ISubmittedWebsite>('v1/websites', submission)

    const { data } = await api.get('v1/websites/status', {
      params: { ids: `${created.data.id},nao-existe` },
    })

    expect(data).toEqual([{ id: created.data.id, status: 'checking' }])
  })

  it('rejects invalid and duplicate submissions', async () => {
    await expect(
      rejection(api.post('v1/websites', { ...submission, categories: [] }))
    ).resolves.toMatchObject({ code: 'invalid', status: 422 })

    await api.post('v1/websites', submission)
    await expect(
      rejection(api.post('v1/websites', submission))
    ).resolves.toMatchObject({ code: 'duplicate', status: 409 })
  })

  it('verifies a website and 404s unknown ids', async () => {
    const { data } = await api.post('v1/websites/4/verify')
    expect(data).toMatchObject({ verified: true })

    await expect(
      rejection(api.post('v1/websites/nao-existe/verify'))
    ).resolves.toMatchObject({ code: 'not_found', status: 404 })
  })
})

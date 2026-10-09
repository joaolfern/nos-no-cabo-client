import { v1Api } from '@/api/api'
import { resetMockMetrics } from '@/__mocks__/data/metrics'
import { getMockReports, resetMockReports } from '@/__mocks__/data/reports'
import { mockPreview, resetMockSubmissions } from '@/__mocks__/data/submissions'
import type { IApiError } from '@/interfaces/IApiError'
import type { IWebsitePage, IWebsiteStats } from '@/interfaces/IWebsiteStats'
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

beforeEach(() => {
  resetMockSubmissions()
  resetMockReports()
  resetMockMetrics()
})

describe('v1 mock handlers', () => {
  it('previews a new url', async () => {
    const { data } = await v1Api.get<IWebsitePreview>('websites/preview', {
      params: { url: 'meu-site.dev' },
    })

    expect(data).toMatchObject({
      url: 'https://meu-site.dev/',
      name: 'Meu-site',
      faviconUrl: 'https://meu-site.dev/favicon.ico',
    })
  })

  it('accepts push subscriptions only for sites still in review', async () => {
    const { data: website } = await v1Api.post<ISubmittedWebsite>(
      'websites',
      submission
    )
    const subscription = {
      endpoint: 'https://fcm.googleapis.com/fcm/send/abc',
      keys: { p256dh: 'p256dh', auth: 'auth' },
    }

    await expect(
      v1Api.post(`websites/${website.id}/subscriptions`, subscription)
    ).resolves.toMatchObject({ status: 204 })
    await expect(
      rejection(v1Api.post('websites/1/subscriptions', subscription))
    ).resolves.toMatchObject({ code: 'not_found', status: 404 })
  })

  it('reports duplicates and unreachable urls with the error envelope', async () => {
    await expect(
      rejection(
        v1Api.get('websites/preview', {
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
        v1Api.get('websites/preview', {
          params: { url: 'site-inacessivel.org' },
        })
      )
    ).resolves.toMatchObject({ code: 'unreachable', status: 422 })
  })

  it('accepts a submission as checking and serves it by id', async () => {
    const created = await v1Api.post<ISubmittedWebsite>('websites', submission)

    expect(created.status).toBe(202)
    expect(created.data.status).toBe('checking')

    const { data } = await v1Api.get<ISubmittedWebsite>(
      `websites/${created.data.id}`
    )
    expect(data).toMatchObject({ id: created.data.id, status: 'checking' })
  })

  it('returns the status of several submissions in one request', async () => {
    const created = await v1Api.post<ISubmittedWebsite>('websites', submission)

    const { data } = await v1Api.get('websites/status', {
      params: { ids: `${created.data.id},nao-existe` },
    })

    expect(data).toEqual([{ id: created.data.id, status: 'checking' }])
  })

  it('rejects invalid and duplicate submissions', async () => {
    await expect(
      rejection(v1Api.post('websites', { ...submission, categories: [] }))
    ).resolves.toMatchObject({ code: 'invalid', status: 422 })

    await v1Api.post('websites', submission)
    await expect(
      rejection(v1Api.post('websites', submission))
    ).resolves.toMatchObject({ code: 'duplicate', status: 409 })
  })

  it('verifies a website and 404s unknown ids', async () => {
    const { data } = await v1Api.post('websites/4/verify')
    expect(data).toMatchObject({ verified: true })

    await expect(
      rejection(v1Api.post('websites/nao-existe/verify'))
    ).resolves.toMatchObject({ code: 'not_found', status: 404 })
  })

  it('accepts a report on a published site and refuses others', async () => {
    const { status } = await v1Api.post('websites/1/reports', {
      reason: 'spam',
      comment: ' propaganda ',
    })
    expect(status).toBe(202)
    expect(getMockReports('1')).toEqual([
      { reason: 'spam', comment: 'propaganda' },
    ])

    await expect(
      rejection(v1Api.post('websites/1/reports', { reason: 'chato' }))
    ).resolves.toMatchObject({ code: 'invalid', status: 422 })

    const { data: checking } = await v1Api.post<ISubmittedWebsite>(
      'websites',
      submission
    )
    await expect(
      rejection(
        v1Api.post(`websites/${checking.id}/reports`, { reason: 'spam' })
      )
    ).resolves.toMatchObject({ code: 'not_found', status: 404 })
  })

  it('serves stats and counts a vote once per voter', async () => {
    const voterId = '6f1c2b8e-4d3a-4f5e-9a7b-1c2d3e4f5a6b'
    const { data: before } = await v1Api.get<IWebsiteStats>('websites/1/stats')

    const { data: liked } = await v1Api.post<IWebsiteStats>(
      'websites/1/votes',
      {
        voterId,
        value: 1,
      }
    )
    expect(liked.likes).toBe(before.likes + 1)

    const { data: switched } = await v1Api.post<IWebsiteStats>(
      'websites/1/votes',
      { voterId, value: -1 }
    )
    expect(switched).toMatchObject({
      likes: before.likes,
      dislikes: before.dislikes + 1,
    })

    await expect(
      rejection(v1Api.post('websites/1/votes', { voterId: 'eu', value: 1 }))
    ).resolves.toMatchObject({ code: 'invalid', status: 422 })
    await expect(
      rejection(v1Api.post('websites/nada/votes', { voterId, value: 1 }))
    ).resolves.toMatchObject({ code: 'not_found', status: 404 })
  })

  it('serves the whole website page in one response', async () => {
    const { data } = await v1Api.get<IWebsitePage>('websites/2/page')

    expect(data.website).toMatchObject({ id: '2', status: 'published' })
    expect(data.neighbours.next).not.toBeNull()
    expect(data.stats).toMatchObject({ clicks: expect.any(Number) })

    await expect(
      rejection(v1Api.get('websites/nada/page'))
    ).resolves.toMatchObject({ code: 'not_found', status: 404 })
  })
})

describe('mockPreview', () => {
  it("uses the page's meta description when there is one", () => {
    expect(
      mockPreview('https://site.dev', 'Descrição da página.')?.description
    ).toBe('Descrição da página.')
  })

  it('falls back to the placeholder without one', () => {
    expect(mockPreview('https://site.dev', null)?.description).toBe(
      'Projeto independente publicado em site.dev.'
    )
  })
})

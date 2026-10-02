import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { render } from '@/__tests__/utils.test'
import { server } from '@/__mocks__/node'
import { V1_API_URL } from '@/config/env'
import { resetMockSubmissions } from '@/__mocks__/data/submissions'
import { SubmitWebsite } from '@/pages/SubmitWebsite/SubmitWebsite'

const urlInput = () => screen.getByLabelText('Endereço do site')
const nameInput = () => screen.getByLabelText('Nome')
const submitButton = () => screen.getByRole('button', { name: 'Enviar site' })

async function typeUrl(url: string) {
  await userEvent.type(urlInput(), url)
}

beforeEach(() => {
  localStorage.clear()
  resetMockSubmissions()
  window.history.pushState({}, '', '/websites/novo')
})

describe('SubmitWebsite', () => {
  it('prefills from the preview, submits and goes straight to the feed', async () => {
    await render(<SubmitWebsite />)

    await typeUrl('meu-projeto.dev')
    await waitFor(() => expect(nameInput()).toHaveValue('Meu-projeto'))
    expect(screen.getByLabelText('Descrição')).toHaveValue(
      'Projeto independente publicado em meu-projeto.dev.'
    )

    await userEvent.click(screen.getByRole('checkbox', { name: 'Educação' }))
    await userEvent.click(submitButton())

    expect(
      await screen.findByText(/Site publicado. Ele estará visível/)
    ).toBeInTheDocument()
    expect(window.location.pathname).toBe('/websites')
    expect(
      JSON.parse(localStorage.getItem('nnc-pending-submissions') ?? '[]')
    ).toEqual([
      expect.objectContaining({ name: 'Meu-projeto', status: 'checking' }),
    ])
  })

  it('keeps no draft when the server publishes right away', async () => {
    server.use(
      http.post(`${V1_API_URL}/websites`, async ({ request }) => {
        const body = (await request.json()) as { url: string; name: string }
        return HttpResponse.json(
          {
            id: 'ja-publicado',
            url: body.url,
            shortCode: null,
            name: body.name,
            description: '',
            color: null,
            faviconUrl: null,
            categories: ['educacao'],
            status: 'published',
            verifiedAt: null,
            submittedAt: new Date().toISOString(),
            publishedAt: new Date().toISOString(),
          },
          { status: 202 }
        )
      })
    )
    await render(<SubmitWebsite />)

    await typeUrl('meu-projeto.dev')
    await waitFor(() => expect(nameInput()).toHaveValue('Meu-projeto'))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Educação' }))
    await userEvent.click(submitButton())

    await waitFor(() => expect(window.location.pathname).toBe('/websites'))
    expect(localStorage.getItem('nnc-pending-submissions')).toBeNull()
  })

  it('links to the existing page and blocks a duplicate', async () => {
    await render(<SubmitWebsite />)

    await typeUrl('www.queridodiario.ok.org.br')

    expect(
      await screen.findByText(/Esse site já está no Nós no Cabo/)
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Ver página do site' })
    ).toHaveAttribute('href', '/website/1')

    await userEvent.click(screen.getByRole('checkbox', { name: 'Cidades' }))
    await userEvent.click(submitButton())

    expect(screen.queryByText(/Site publicado/)).not.toBeInTheDocument()
    expect(window.location.pathname).toBe('/websites/novo')
  })

  it('lets an unreachable site be filled in by hand', async () => {
    await render(<SubmitWebsite />)

    await typeUrl('site-inacessivel.org')
    expect(
      await screen.findByText(/Não conseguimos acessar esse endereço/)
    ).toBeInTheDocument()

    await userEvent.type(nameInput(), 'Site manual')
    await userEvent.click(screen.getByRole('checkbox', { name: 'Saúde' }))
    await userEvent.click(submitButton())

    expect(
      await screen.findByText(/Site publicado. Ele estará visível/)
    ).toBeInTheDocument()
    expect(window.location.pathname).toBe('/websites')
  })

  it('shows every validation error and focuses the first one', async () => {
    await render(<SubmitWebsite />)

    await userEvent.click(submitButton())

    expect(urlInput()).toHaveFocus()
    expect(urlInput()).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText(/Informe um endereço válido/)).toBeInTheDocument()
    expect(screen.getByText(/pelo menos 3 caracteres/)).toBeInTheDocument()
    expect(
      screen.getByText('Escolha pelo menos uma categoria.')
    ).toBeInTheDocument()
  })

  it('keeps edited fields when the url changes', async () => {
    await render(<SubmitWebsite />)

    await typeUrl('primeiro.dev')
    await waitFor(() => expect(nameInput()).toHaveValue('Primeiro'))

    await userEvent.clear(nameInput())
    await userEvent.type(nameInput(), 'Meu nome')
    await userEvent.clear(urlInput())
    await typeUrl('segundo.dev')

    await waitFor(() =>
      expect(screen.getByLabelText('Descrição')).toHaveValue(
        'Projeto independente publicado em segundo.dev.'
      )
    )
    expect(nameInput()).toHaveValue('Meu nome')
  })

  it('allows at most three categories', async () => {
    await render(<SubmitWebsite />)

    for (const name of ['Educação', 'Saúde', 'Cidades']) {
      await userEvent.click(screen.getByRole('checkbox', { name }))
    }

    expect(screen.getByRole('checkbox', { name: 'Inclusão' })).toBeDisabled()
    expect(screen.getByRole('checkbox', { name: 'Saúde' })).toBeEnabled()
  })
})

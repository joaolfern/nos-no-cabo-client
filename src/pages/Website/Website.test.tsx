import { screen, waitFor, within } from '@testing-library/react'
import { Route, Routes } from 'react-router'
import userEvent from '@testing-library/user-event'
import { render } from '@/__tests__/utils.test'
import { V1_API_URL } from '@/config/env'
import { v1Api } from '@/api/api'
import type { ISubmittedWebsite } from '@/interfaces/IWebsite'
import { mockNeighbours } from '@/__mocks__/data/catalog'
import { mockStats } from '@/__mocks__/data/metrics'
import { server } from '@/__mocks__/node'
import { Website } from '@/pages/Website/Website'

async function renderWebsite(id: string) {
  window.history.pushState({}, '', `/website/${id}`)
  await render(
    <Routes>
      <Route path='/website/:id' element={<Website />} />
    </Routes>
  )
}

describe('Website page', () => {
  it('shows the site from /v1 and its ring neighbours', async () => {
    const neighbours = mockNeighbours('2')

    await renderWebsite('2')

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Conjuntura do mercado de trabalho brasileiro',
      })
    ).toBeInTheDocument()
    expect(
      await screen.findByTitle(neighbours?.previous?.name ?? '')
    ).toHaveAttribute('href', `/website/${neighbours?.previous?.id}`)
    expect(screen.getByTitle(neighbours?.next?.name ?? '')).toHaveAttribute(
      'href',
      `/website/${neighbours?.next?.id}`
    )
  })

  it('shows the real stats and visits through the short link', async () => {
    const stats = mockStats('2')

    await renderWebsite('2')

    expect(
      await screen.findByText(stats.clicks30d.toLocaleString('pt-BR'))
    ).toBeInTheDocument()
    expect(
      screen.getByText(stats.referrals.toLocaleString('pt-BR'))
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: stats.clicks.toLocaleString('pt-BR') })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Visitar site/ })).toHaveAttribute(
      'href',
      'https://nosnocabo.pages.dev/r/2'
    )
  })

  it('loads the site, its neighbours and its stats in one request', async () => {
    const paths: string[] = []
    const track = ({ request }: { request: Request }) => {
      paths.push(new URL(request.url).pathname)
    }
    server.events.on('request:start', track)

    await renderWebsite('2')
    await screen.findByText(mockStats('2').clicks30d.toLocaleString('pt-BR'))
    server.events.removeListener('request:start', track)

    const sitePaths = paths.filter((path) => path.includes('/websites/2'))
    expect(sitePaths).toEqual(['/v1/websites/2/page'])
  })

  it('offers the badge and copies the short link and API in the side column', async () => {
    const user = userEvent.setup()
    await renderWebsite('2')

    const side = await screen.findByRole('complementary', {
      name: 'Sobre este site',
    })
    expect(
      within(side).getByRole('link', { name: 'Adicionar o selo' })
    ).toHaveAttribute('href', '/websites/2/selo')
    await user.click(within(side).getByRole('button', { name: 'Copiar link' }))
    expect(await navigator.clipboard.readText()).toBe(
      'https://nosnocabo.pages.dev/r/2'
    )
    expect(
      within(side).getByRole('button', { name: 'Copiado!' })
    ).toBeInTheDocument()

    await user.click(within(side).getByRole('button', { name: 'Copiar API' }))
    expect(await navigator.clipboard.readText()).toBe(
      `${V1_API_URL}/websites/2`
    )
  })

  it('shows when a verified site got its badge', async () => {
    await renderWebsite('4')

    const side = await screen.findByRole('complementary', {
      name: 'Sobre este site',
    })
    expect(within(side).getByText(/Verificado em/)).toBeInTheDocument()
    expect(
      within(side).getByRole('link', {
        name: 'Personalizar e copiar o selo',
      })
    ).toHaveAttribute('href', '/websites/4/selo')
    expect(
      within(side).queryByRole('button', { name: 'Verificar' })
    ).not.toBeInTheDocument()
  })

  it('recommends six other sites', async () => {
    await renderWebsite('2')

    const section = (
      await screen.findByRole('heading', { name: 'Sites recomendados' })
    ).closest('section') as HTMLElement

    await waitFor(() =>
      expect(within(section).getAllByTestId('feed-card')).toHaveLength(6)
    )
    expect(
      within(section).queryByText(
        'Conjuntura do mercado de trabalho brasileiro'
      )
    ).not.toBeInTheDocument()
  })

  it('marks a site under review and hides the report button', async () => {
    const { data } = await v1Api.post<ISubmittedWebsite>('websites', {
      url: 'https://em-analise.dev',
      name: 'Em análise',
      categories: ['outros'],
    })

    await renderWebsite(data.id)

    expect(
      await screen.findByText(/Este site está em análise/)
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Notificar problema' })
    ).not.toBeInTheDocument()
  })

  it('shows the ring neighbours together with the site, with no placeholders left', async () => {
    const neighbours = mockNeighbours('2')
    await renderWebsite('2')

    await screen.findByRole('heading', { level: 1 })
    expect(screen.getByTitle(neighbours?.next?.name ?? '')).toBeInTheDocument()
    expect(screen.queryAllByText('Carregando vizinho')).toHaveLength(0)
  })

  it('holds the page with a loading state instead of collapsing it', async () => {
    await renderWebsite('2')

    expect(
      screen.getByRole('status', { name: 'Carregando site' })
    ).toBeInTheDocument()
    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.queryByRole('status', { name: 'Carregando site' })).toBeNull()
  })

  it('names the page and describes it with the site it shows', async () => {
    await renderWebsite('2')

    await screen.findByRole('heading', { level: 1 })
    await waitFor(() =>
      expect(document.title).toBe(
        'Conjuntura do mercado de trabalho brasileiro · Nós no Cabo'
      )
    )
    expect(
      document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')
    ).toBe('https://nosnocabo.pages.dev/website/2')
  })

  it('shows a not-found page for a site that does not exist', async () => {
    await renderWebsite('nao-existe')

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Site não encontrado',
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Ver todos os projetos/ })
    ).toHaveAttribute('href', '/websites')
    await waitFor(() =>
      expect(document.title).toBe('Site não encontrado · Nós no Cabo')
    )
  })
})

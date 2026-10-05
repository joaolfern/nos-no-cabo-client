import { screen, waitFor, within } from '@testing-library/react'
import { Route, Routes } from 'react-router'
import { render } from '@/__tests__/utils.test'
import { v1Api } from '@/api/api'
import type { ISubmittedWebsite } from '@/interfaces/IWebsite'
import { mockNeighbours } from '@/__mocks__/data/catalog'
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

  it('holds the ring navigation row with placeholders until the neighbours arrive', async () => {
    const neighbours = mockNeighbours('2')
    await renderWebsite('2')

    await screen.findByRole('heading', { level: 1 })
    expect(screen.getAllByText('Carregando vizinho')).toHaveLength(3)

    expect(
      await screen.findByTitle(neighbours?.next?.name ?? '')
    ).toBeInTheDocument()
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
})

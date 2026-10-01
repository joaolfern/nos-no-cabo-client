import { screen } from '@testing-library/react'
import { render } from '@/__tests__/utils.test'
import { Terms } from '@/pages/Terms/Terms'

describe('Terms', () => {
  it('shows the version, the curation rules and the contact', async () => {
    await render(<Terms />)

    expect(
      screen.getByRole('heading', { level: 1, name: 'Termos de uso' })
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Versão de 1º de outubro de 2026/)
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: '4. Curadoria automática' })
    ).toBeInTheDocument()
    expect(
      screen.getByText('conteúdo sexual ou adulto (NSFW);')
    ).toBeInTheDocument()
    expect(
      screen.getAllByRole('link', { name: 'joaolfern@proton.me' })[0]
    ).toHaveAttribute('href', 'mailto:joaolfern@proton.me')
  })
})

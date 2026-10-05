import { screen, waitFor } from '@testing-library/react'
import { render } from '@/__tests__/utils.test'
import { Router } from '@/providers/RouterProvider/routes'

const visit = async (path: string) => {
  window.history.pushState({}, '', path)
  await render(<Router />)
}

describe('Router', () => {
  it('loads a page chunk inside its layout', async () => {
    await visit('/termos')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Termos de uso' })
    ).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('loads the not-found page for unknown paths', async () => {
    await visit('/nao-existe')

    expect(await screen.findByText(/não encontrad/i)).toBeInTheDocument()
  })

  it.each(['/r/abc123', '/ring/01SITE/next'])(
    'sends %s home when the ring router is bypassed',
    async (path) => {
      await visit(path)

      await waitFor(() => expect(window.location.pathname).toBe('/'))
    }
  )
})

import { screen } from '@testing-library/react'
import { render } from '@/__tests__/utils.test'
import { SiteFooter } from '@/layouts/NosNoCaboLayout/components/SiteFooter/SiteFooter'

describe('SiteFooter', () => {
  it('links to the terms and the contact e-mail', async () => {
    await render(<SiteFooter />)

    expect(screen.getByRole('link', { name: 'Termos de uso' })).toHaveAttribute(
      'href',
      '/termos'
    )
    expect(screen.getByRole('link', { name: 'Contato' })).toHaveAttribute(
      'href',
      'mailto:joaolfern@proton.me'
    )
  })
})

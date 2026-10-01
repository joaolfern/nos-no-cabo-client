import { screen } from '@testing-library/react'
import { render } from '@/__tests__/utils.test'
import { PageTrail } from '@/components/PageTrail/PageTrail'

describe('PageTrail', () => {
  it('links back and marks only the last crumb as the current page', async () => {
    await render(
      <PageTrail
        backTo='/websites'
        crumbs={[
          { label: 'Projetos', to: '/websites' },
          { label: 'Rascunho' },
          { label: 'Selo', to: '/ignorado' },
        ]}
      />
    )

    expect(screen.getByRole('link', { name: 'Voltar' })).toHaveAttribute(
      'href',
      '/websites'
    )
    expect(screen.getByRole('link', { name: 'Projetos' })).toBeInTheDocument()
    expect(screen.getByText('Rascunho')).not.toHaveAttribute('aria-current')
    expect(screen.getByText('Selo')).toHaveAttribute('aria-current', 'page')
    expect(screen.queryByRole('link', { name: 'Selo' })).not.toBeInTheDocument()
  })
})

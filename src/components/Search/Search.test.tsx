import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { Search } from '@/components/Search/Search'

function ControlledSearch() {
  const [value, setValue] = useState('')
  return (
    <Search placeholder='Buscar projetos…' value={value} onChange={setValue} />
  )
}

const field = () => screen.getByPlaceholderText('Buscar projetos…')
const closeButton = () => screen.queryByRole('button', { name: 'Fechar busca' })

describe('Search', () => {
  it('collapses when the search is cleared', async () => {
    render(<ControlledSearch />)

    await userEvent.click(field())
    await userEvent.type(field(), 'saúde')
    expect(closeButton()).toBeInTheDocument()

    await userEvent.click(closeButton() as HTMLElement)

    expect(field()).toHaveValue('')
    expect(field()).not.toHaveFocus()
    expect(closeButton()).not.toBeInTheDocument()
  })

  it('collapses when an empty search loses focus, and stays open with text', async () => {
    render(
      <>
        <ControlledSearch />
        <button type='button'>fora</button>
      </>
    )

    await userEvent.click(field())
    await userEvent.click(screen.getByRole('button', { name: 'fora' }))
    expect(closeButton()).not.toBeInTheDocument()

    await userEvent.click(field())
    await userEvent.type(field(), 'cidades')
    await userEvent.click(screen.getByRole('button', { name: 'fora' }))
    expect(closeButton()).toBeInTheDocument()
  })
})

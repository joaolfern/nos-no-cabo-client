import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Pagination } from './Pagination'

describe('Pagination', () => {
  it('renders nothing when there is a single page', () => {
    const { container } = render(
      <Pagination page={1} pageCount={1} onChange={jest.fn()} />
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('marks the current page', () => {
    render(<Pagination page={2} pageCount={3} onChange={jest.fn()} />)

    expect(screen.getByRole('button', { name: 'Página 2' })).toHaveAttribute(
      'aria-current',
      'page'
    )
    expect(
      screen.getByRole('button', { name: 'Página 1' })
    ).not.toHaveAttribute('aria-current')
  })

  it('goes to the chosen, previous and next pages', async () => {
    const onChange = jest.fn()
    render(<Pagination page={2} pageCount={3} onChange={onChange} />)

    await userEvent.click(screen.getByRole('button', { name: 'Página 3' }))
    await userEvent.click(
      screen.getByRole('button', { name: 'Página anterior' })
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Próxima página' })
    )

    expect(onChange.mock.calls).toEqual([[3], [1], [3]])
  })

  it('disables previous on the first page and next on the last', () => {
    const { rerender } = render(
      <Pagination page={1} pageCount={3} onChange={jest.fn()} />
    )
    expect(
      screen.getByRole('button', { name: 'Página anterior' })
    ).toBeDisabled()

    rerender(<Pagination page={3} pageCount={3} onChange={jest.fn()} />)
    expect(
      screen.getByRole('button', { name: 'Próxima página' })
    ).toBeDisabled()
  })
})

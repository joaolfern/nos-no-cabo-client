import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ViewToggle } from './ViewToggle'

describe('ViewToggle', () => {
  it('shows which view is active', () => {
    render(<ViewToggle value='list' onChange={vi.fn()} />)

    expect(
      screen.getByRole('button', { name: 'Ver em lista' })
    ).toHaveAttribute('aria-pressed', 'true')
    expect(
      screen.getByRole('button', { name: 'Ver em grade' })
    ).toHaveAttribute('aria-pressed', 'false')
  })

  it('reports the chosen view', async () => {
    const onChange = vi.fn()
    render(<ViewToggle value='grid' onChange={onChange} />)

    await userEvent.click(screen.getByRole('button', { name: 'Ver em lista' }))

    expect(onChange).toHaveBeenCalledWith('list')
  })
})

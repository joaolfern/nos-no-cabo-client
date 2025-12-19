import { render, screen, fireEvent } from '@testing-library/react'
import { Link } from './Link'

describe('Link', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/nosnocabo')
  })

  it('updates the query string in the URL on click', () => {
    render(
      <Link to='/' data-testid='link'>
        Test Link
      </Link>
    )
    const link = screen.getByTestId('link')
    fireEvent.click(link)
    expect(window.location.search).toBe('?id=42')
  })

  it('dispatches query-change event with correct detail', () => {
    const handler = jest.fn()
    window.addEventListener('query-change', handler)
    render(
      <Link to='/42' data-testid='link'>
        Test Link
      </Link>
    )
    fireEvent.click(screen.getByTestId('link'))
    expect(handler).toHaveBeenCalled()
    const event = handler.mock.calls[0][0]

    expect(event.detail.query).toEqual({ id: '42' })
    window.removeEventListener('query-change', handler)
  })

  it('does not trigger navigation or add history entry if using replaceState', () => {
    const originalPushState = window.history.pushState
    window.history.pushState = jest.fn()
    render(
      <Link to='/' data-testid='link'>
        Test Link
      </Link>
    )
    fireEvent.click(screen.getByTestId('link'))
    expect(window.history.pushState).toHaveBeenCalled()
    window.history.pushState = originalPushState
  })

  it('sets href if ctrlKey is pressed', () => {
    render(
      <Link to='/' data-testid='link'>
        Test Link
      </Link>
    )
    const link = screen.getByTestId('link')
    fireEvent.click(link, { ctrlKey: true })
    expect(link).toHaveAttribute('href', expect.stringContaining('?id=42'))
  })
})

import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { Button } from '@/components/Button/Button'

describe('AsChild usage in Button', () => {
  function AuxLink(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
    return (
      <a data-testid='aux-link' {...props}>
        Link Child
      </a>
    )
  }

  it('renders a link instead of a button and passes props', () => {
    const handleClick = jest.fn()
    render(
      <Button asChild onClick={handleClick}>
        <AuxLink href='/test' />
      </Button>
    )
    const link = screen.getByTestId('aux-link')
    expect(link).toBeInTheDocument()
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', '/test')
  })

  it('calls onClick when link is clicked', () => {
    const handleClick = jest.fn()
    render(
      <Button asChild onClick={handleClick}>
        <AuxLink href='/test' />
      </Button>
    )
    const link = screen.getByTestId('aux-link')
    fireEvent.click(link)
    expect(handleClick).toHaveBeenCalled()
  })
})

import { fireEvent, render, screen } from '@testing-library/react'
import { WebsiteBubble } from '@/pages/Website/components/WebsiteBubble/WebsiteBubble'

describe('WebsiteBubble', () => {
  it('falls back to the Nós no Cabo icon when the site icon fails to load', () => {
    render(
      <WebsiteBubble
        id='a'
        title='Alfa'
        url='/website/a'
        imageSrc='https://alfa.dev/quebrado.ico'
      />
    )
    const image = screen.getByRole('img', { name: 'Alfa' })

    fireEvent.error(image)
    expect(image).toHaveAttribute('src', '/favicon.svg')

    fireEvent.error(image)
    expect(image).toHaveAttribute('src', '/favicon.svg')
  })
})

import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useMessage } from '@/contexts/useMessage'
import { MessageProvider } from '@/providers/MessageProvider/MessageProvider'

function ShowButton() {
  const { showMessage } = useMessage()
  return (
    <button onClick={() => showMessage('Site publicado.', { tone: 'success' })}>
      Mostrar
    </button>
  )
}

// jsdom has no AnimationEvent, so React listens for the prefixed name.
function endAnimation(element: HTMLElement) {
  act(() => {
    element.dispatchEvent(new Event('webkitAnimationEnd', { bubbles: true }))
  })
}

function renderProvider() {
  return render(
    <MessageProvider>
      <ShowButton />
    </MessageProvider>
  )
}

describe('MessageProvider', () => {
  it('announces the message in a polite live region', async () => {
    renderProvider()

    await userEvent.click(screen.getByRole('button', { name: 'Mostrar' }))

    expect(screen.getByRole('status')).toHaveTextContent('Site publicado.')
  })

  it('removes the message once its leave animation ends', async () => {
    renderProvider()
    await userEvent.click(screen.getByRole('button', { name: 'Mostrar' }))
    const message = screen.getByText('Site publicado.').parentElement!

    endAnimation(message)
    expect(screen.getByText('Site publicado.')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Fechar aviso' }))
    endAnimation(message)

    expect(screen.queryByText('Site publicado.')).not.toBeInTheDocument()
  })
})

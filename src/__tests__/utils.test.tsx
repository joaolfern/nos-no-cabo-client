import { screen } from '@testing-library/dom'
import { Providers } from '@/providers'
import { render as renderBase } from '@testing-library/react'

export async function render(children: React.ReactNode) {
  return renderBase(children, {
    wrapper: Providers,
  })
}

describe('Utils', () => {
  it('Should assert that tests are set up correctly', () => {
    render(<div>Testing is working</div>)

    screen.getByText('Testing is working')
  })
})

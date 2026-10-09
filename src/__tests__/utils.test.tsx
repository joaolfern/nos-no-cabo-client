import { screen } from '@testing-library/dom'
import { AppProviders, Providers } from '@/providers'
import { render as renderBase } from '@testing-library/react'
import { RouterProvider, createBrowserRouter } from 'react-router'

export async function render(children: React.ReactNode) {
  return renderBase(children, {
    wrapper: Providers,
  })
}

// For pages that need a data router (useBlocker); every path renders the same children.
export async function renderInDataRouter(children: React.ReactNode) {
  const router = createBrowserRouter([
    { path: '*', element: <AppProviders>{children}</AppProviders> },
  ])
  return renderBase(<RouterProvider router={router} />)
}

describe('Utils', () => {
  it('Should assert that tests are set up correctly', () => {
    render(<div>Testing is working</div>)

    screen.getByText('Testing is working')
  })
})

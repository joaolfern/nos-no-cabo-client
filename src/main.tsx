import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Providers } from '@/providers'
import { ENABLE_MOCKS } from '@/config/env'
import { Router } from '@/providers/RouterProvider/routes'
import './styles/index.scss'

async function enableMocking() {
  if (!ENABLE_MOCKS) {
    return
  }

  const { worker } = await import('./__mocks__/browser')

  return worker.start()
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Providers>
        <Router />
      </Providers>
    </StrictMode>
  )
})

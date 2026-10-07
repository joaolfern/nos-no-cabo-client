import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ENABLE_MOCKS } from '@/config/env'
import { AppRouter } from '@/providers/RouterProvider/AppRouter'
import { reloadOnPreloadError } from '@/utils/reloadOnPreloadError/reloadOnPreloadError'
import './styles/index.scss'

reloadOnPreloadError()

async function enableMocking() {
  if (!ENABLE_MOCKS) {
    return
  }

  const { worker } = await import('./__mocks__/browser')

  return worker.start({ onUnhandledRequest: 'bypass' })
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AppRouter />
    </StrictMode>
  )
})

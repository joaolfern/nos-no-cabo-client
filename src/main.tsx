import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Providers } from '@/providers'
import { Webring } from '@/pages/Webring/Webring'
import './styles/index.scss'
import { ENABLE_MOCKS } from '@/config/env'

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
        <Webring />
      </Providers>
    </StrictMode>
  )
})

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Providers } from '@/providers'
import { NosNoCabo } from '@/pages/NosNoCabo/NosNoCabo'
import './styles/index.scss'

async function enableMocking() {
  if (!import.meta.env.VITE_ENABLE_MOCKS) {
    return
  }

  const { worker } = await import('./__mocks__/browser')

  return worker.start()
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Providers>
        <NosNoCabo />
      </Providers>
    </StrictMode>
  )
})

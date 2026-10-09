import { useEffect } from 'react'
import { useMessage } from '@/contexts/useMessage'
import { registerServiceWorker } from '@/utils/registerServiceWorker/registerServiceWorker'

export function ServiceWorkerUpdatePrompt() {
  const { showMessage } = useMessage()

  useEffect(() => {
    registerServiceWorker((applyUpdate) =>
      showMessage('Nova versão disponível.', {
        persistent: true,
        action: { label: 'Atualizar', onPress: applyUpdate },
      })
    )
  }, [showMessage])

  return null
}

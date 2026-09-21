import { Modal } from '@/components/Modal/Modal'
import { WebsiteForm } from './WebsiteForm'
import { useWebsiteForm } from './hooks/useWebsiteForm'

export function WebsiteFormModal() {
  const { handleClose, handleSuccess, isOpen } = useWebsiteForm()

  return (
    <Modal onClose={handleClose} isOpen={isOpen}>
      {isOpen && <WebsiteForm onSuccess={handleSuccess} />}
    </Modal>
  )
}

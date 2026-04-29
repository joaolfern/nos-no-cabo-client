import { FloatingButton } from '@/components/FloatingButton/FloatingButton'
import { MdAdd } from 'react-icons/md'
import styles from './WebsiteForm.module.scss'
import { useWebsiteForm } from './hooks/useWebsiteForm'

export function WebsiteFormFloating() {
  const { handleCreate, isOpen } = useWebsiteForm()

  return (
    <div className={styles.container}>
      <FloatingButton
        className={styles.button}
        variant={isOpen ? 'secondary' : 'primary'}
        onClick={handleCreate}
      >
        Adicionar meu site
        <MdAdd />
      </FloatingButton>
    </div>
  )
}

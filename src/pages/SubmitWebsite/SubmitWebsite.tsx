import { useNavigate } from 'react-router'
import { useMessage } from '@/contexts/useMessage'
import { SubmitForm } from '@/pages/SubmitWebsite/components/SubmitForm/SubmitForm'
import styles from './SubmitWebsite.module.scss'

export function SubmitWebsite() {
  const navigate = useNavigate()
  const { showMessage } = useMessage()

  function handleSubmitted() {
    showMessage(
      'Site publicado. Ele estará visível para outros usuários em minutos.'
    )
    navigate('/websites')
  }

  return (
    <div className={styles.page}>
      <SubmitForm onSubmitted={handleSubmitted} />
    </div>
  )
}

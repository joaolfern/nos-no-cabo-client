import { useNavigate } from 'react-router'
import { PageTrail } from '@/components/PageTrail/PageTrail'
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
      <PageTrail
        backTo='/websites'
        crumbs={[
          { label: 'Projetos', to: '/websites' },
          { label: 'Adicionar um site' },
        ]}
      />
      <SubmitForm onSubmitted={handleSubmitted} />
    </div>
  )
}

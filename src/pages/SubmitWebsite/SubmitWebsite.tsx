import { useNavigate } from 'react-router'
import { PageTrail } from '@/components/PageTrail/PageTrail'
import { useMessage } from '@/contexts/useMessage'
import type { ISubmittedWebsite } from '@/interfaces/IWebsite'
import { SubmitForm } from '@/pages/SubmitWebsite/components/SubmitForm/SubmitForm'
import styles from './SubmitWebsite.module.scss'

export function SubmitWebsite() {
  const navigate = useNavigate()
  const { showMessage } = useMessage()

  function handleSubmitted(website: ISubmittedWebsite) {
    showMessage(
      website.status === 'published'
        ? 'Site publicado.'
        : 'Site enviado. Ele aparece para todo mundo assim que for aprovado.'
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

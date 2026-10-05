import { useNavigate } from 'react-router'
import { usePageMeta } from '@/hooks/usePageMeta'
import { PageTrail } from '@/components/PageTrail/PageTrail'
import { useMessage } from '@/contexts/useMessage'
import type { ISubmittedWebsite } from '@/interfaces/IWebsite'
import { SubmitForm } from '@/pages/SubmitWebsite/components/SubmitForm/SubmitForm'
import styles from './SubmitWebsite.module.scss'

export function SubmitWebsite() {
  usePageMeta({
    title: 'Adicionar um site',
    description:
      'Cole o endereço de um projeto brasileiro de tecnologia e adicione-o ao Nós no Cabo.',
    path: '/websites/novo',
  })
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

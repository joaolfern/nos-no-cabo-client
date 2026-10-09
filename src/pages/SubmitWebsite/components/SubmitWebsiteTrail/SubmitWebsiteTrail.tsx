import { PageTrail } from '@/components/PageTrail/PageTrail'

export function SubmitWebsiteTrail() {
  return (
    <PageTrail
      backTo='/websites'
      crumbs={[
        { label: 'Projetos', to: '/websites' },
        { label: 'Adicionar um site' },
      ]}
    />
  )
}

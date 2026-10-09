import { PageTrail } from '@/components/PageTrail/PageTrail'

export function TermsTrail() {
  return (
    <PageTrail
      backTo='/websites'
      crumbs={[
        { label: 'Projetos', to: '/websites' },
        { label: 'Termos de uso' },
      ]}
    />
  )
}

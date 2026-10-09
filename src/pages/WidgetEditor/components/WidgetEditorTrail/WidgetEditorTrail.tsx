import { PageTrail, type Crumb } from '@/components/PageTrail/PageTrail'
import type { ISubmittedWebsite } from '@/interfaces/IWebsite'

type WidgetEditorTrailProps = {
  websiteId: string
  website?: ISubmittedWebsite
}

function trailCrumbs(id: string, website?: ISubmittedWebsite): Crumb[] {
  const siteCrumb: Crumb[] = website
    ? [
        {
          label: website.name,
          to: website.status === 'published' ? `/website/${id}` : undefined,
        },
      ]
    : []

  return [
    { label: 'Projetos', to: '/websites' },
    ...siteCrumb,
    { label: 'Selo' },
  ]
}

export function WidgetEditorTrail({
  websiteId,
  website,
}: WidgetEditorTrailProps) {
  return (
    <PageTrail backTo='/websites' crumbs={trailCrumbs(websiteId, website)} />
  )
}

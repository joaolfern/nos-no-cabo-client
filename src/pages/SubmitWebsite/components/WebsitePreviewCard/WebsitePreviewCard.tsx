import { FeedCard } from '@/pages/Feed/components/FeedCard/FeedCard'
import { FeedCardSkeleton } from '@/pages/Feed/components/FeedCard/FeedCardSkeleton'
import type { IWebsite } from '@/interfaces/IWebsite'
import type { SubmissionFormValues } from '@/pages/SubmitWebsite/utils/submissionForm'
import { toAbsoluteUrl } from '@/utils/normalizeUrl/normalizeUrl'
import styles from './WebsitePreviewCard.module.scss'

type WebsitePreviewCardProps = {
  values: SubmissionFormValues
  faviconUrl: string | null | undefined
  isLoading: boolean
}

function toPreviewWebsite(
  values: SubmissionFormValues,
  faviconUrl: string | null | undefined
): IWebsite {
  return {
    id: 'preview',
    name: values.name.trim() || 'Nome do site',
    description:
      values.description.trim() || 'A descrição do site aparece aqui.',
    url: toAbsoluteUrl(values.url) ?? '',
    color: values.color,
    faviconUrl: faviconUrl ?? '',
    keywords: values.categories.map((name) => ({ id: name, name })),
    createdAt: '',
    updatedAt: '',
  }
}

export function WebsitePreviewCard({
  values,
  faviconUrl,
  isLoading,
}: WebsitePreviewCardProps) {
  return (
    <section className={styles.preview} aria-label='Prévia no feed'>
      <p className={styles.caption}>Assim ele aparece no feed</p>
      {isLoading ? (
        <FeedCardSkeleton variant='detailed' />
      ) : (
        <FeedCard website={toPreviewWebsite(values, faviconUrl)} readOnly />
      )}
    </section>
  )
}

import { Typography } from '@/components/Typography/Typography'
import { useWebsiteDetails } from '@/pages/Website/hooks/useWebsiteDetails'
import { WebsiteAuthorAndDate } from '@/pages/Webring/components/WebsiteAuthorAndDate/WebsiteAuthorAndDate'
import { CardImage } from '@/pages/Webring/components/CardImage/CardImage'
import { Divider } from '@/components/Divider/Divider'
import { WebsiteLoader } from '@/pages/Website/components/WebsiteLoader/WebsiteLoader'
import styles from './WebsiteContent.module.scss'
import { LatestWebsites } from '@/pages/Website/components/LatestWebsites/LatestWebsites'
import React from 'react'
import { RecommendBooks } from '@/pages/Website/components/RecommendBooks/RecommendBooks'
import { VisitButton } from '@/pages/Webring/components/VisitButton/VisitButton'

export function WebsiteContent() {
  const { website, isLoading } = useWebsiteDetails()

  if (isLoading) {
    return
  }

  if (!website) throw new Error('Not found')

  return (
    <WebsiteLoader isLoading={isLoading}>
      <section className={styles.container}>
        <header className={styles.header}>
          <Typography variant='h3' asVariant={true} numberOfLines={2}>
            {website.name}
          </Typography>
          <VisitButton url={website.url}>Visitar site</VisitButton>
        </header>

        {website.author && (
          <WebsiteAuthorAndDate.Detailed
            authorName={website.author.name}
            createdAt={website.createdAt}
            authorImage={website.author.profilePicture}
          />
        )}
        <CardImage src={website.faviconUrl} alt={website.name} />
        <Typography variant='body' numberOfLines={2} asVariant={true}>
          {website.description.split('\n').map((line, idx) => (
            <React.Fragment key={idx}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </Typography>
        <Divider />
        <LatestWebsites websiteId={website.id} />
        <RecommendBooks keywords={website.keywords} />
      </section>
    </WebsiteLoader>
  )
}

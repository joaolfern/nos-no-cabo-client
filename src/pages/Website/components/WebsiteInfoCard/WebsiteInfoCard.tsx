import React from 'react'
import { LuArrowUpRight } from 'react-icons/lu'
import { Image } from '@/components/Image/Image'
import { Typography } from '@/components/Typography/Typography'
import { Tag } from '@/components/Tag/Tag'
import { Button } from '@/components/Button/Button'
import { GithubButton } from '@/pages/Webring/components/GithubButton/GithubButton'
import { ReportButton } from '@/pages/Webring/components/ReportButton/ReportButton'
import { WebsiteAuthorAndDate } from '@/pages/Webring/components/WebsiteAuthorAndDate/WebsiteAuthorAndDate'
import { WebsiteVotes } from '@/pages/Website/components/WebsiteVotes/WebsiteVotes'
import type { IWebsite } from '@/interfaces/IWebsite'
import { VerificationStatus } from '@/pages/WidgetEditor/components/VerificationStatus/VerificationStatus'
import { visitUrl } from '@/utils/visitUrl/visitUrl'
import styles from './WebsiteInfoCard.module.scss'
import { getCategoryLabel } from '@/pages/Feed/constants/categories'

interface WebsiteInfoCardProps {
  website: IWebsite
}

export function WebsiteInfoCard({ website }: WebsiteInfoCardProps) {
  const isInReview =
    website.status !== undefined && website.status !== 'published'

  return (
    <aside className={styles.container}>
      <div className={styles.hero}>
        <Image
          className={styles.heroImage}
          src={website.faviconUrl}
          alt={website.name}
        />
        {!isInReview && (
          <div className={styles.reportButtonSlot}>
            <ReportButton id={website.id} name={website.name} />
          </div>
        )}
      </div>

      <div className={styles.body}>
        {isInReview && (
          <p className={styles.reviewNotice} role='status'>
            Este site está em análise e não aparece nas listas por enquanto.
          </p>
        )}
        <div className={styles.titleRow}>
          <Typography
            as='h1'
            variant='titleMd'
            lines={2}
            className={styles.title}
          >
            {website.name}
          </Typography>
          <VerificationStatus
            websiteId={website.id}
            websiteName={website.name}
            verifiedAt={website.verifiedAt}
          />
        </div>

        {(website.author || website.repo) && (
          <div className={styles.meta}>
            {website.author && (
              <WebsiteAuthorAndDate.Compact
                authorName={website.author.name}
                createdAt={website.createdAt}
              />
            )}
            <GithubButton repo={website.repo} />
          </div>
        )}

        {website.description && (
          <Typography as='p' variant='bodyMd' className={styles.description}>
            {website.description.split('\n').map((line, idx) => (
              <React.Fragment key={idx}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </Typography>
        )}

        {website.keywords.length > 0 && (
          <div className={styles.tags}>
            {website.keywords.map((keyword) => (
              <Tag key={keyword.id} className={styles.tag}>
                {getCategoryLabel(keyword.name)}
              </Tag>
            ))}
          </div>
        )}

        <div className={styles.actions}>
          <Button asChild={true} variant='tertiary' className={styles.visit}>
            <a
              href={visitUrl(website)}
              target='_blank'
              rel='noopener noreferrer'
            >
              Visitar site
              <LuArrowUpRight size='1rem' />
            </a>
          </Button>
          <WebsiteVotes websiteId={website.id} />
        </div>
      </div>
    </aside>
  )
}

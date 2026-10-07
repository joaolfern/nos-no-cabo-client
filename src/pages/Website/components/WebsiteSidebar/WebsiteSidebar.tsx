import { LuArrowRight } from 'react-icons/lu'
import { Link } from '@/components/Link/Link'
import { RING_BASE_URL } from '@/config/env'
import type { IWebsite } from '@/interfaces/IWebsite'
import { ShareLink } from '@/pages/Website/components/ShareLink/ShareLink'
import { VerifyPanel } from '@/pages/WidgetEditor/components/VerifyPanel/VerifyPanel'
import styles from './WebsiteSidebar.module.scss'

const VERIFIED_DATE = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'long',
  timeZone: 'UTC',
})

const verifiedOn = (date: string) => VERIFIED_DATE.format(new Date(date))

interface WebsiteSidebarProps {
  website: IWebsite
}

export function WebsiteSidebar({ website }: WebsiteSidebarProps) {
  const link = website.shortCode
    ? `${RING_BASE_URL}/r/${website.shortCode}`
    : website.url

  return (
    <aside className={styles.sidebar} aria-label='Sobre este site'>
      <section className={styles.card} aria-labelledby='website-badge-title'>
        <h2 id='website-badge-title' className={styles.title}>
          Selo da aliança
        </h2>
        {website.verifiedAt ? (
          <>
            <p className={styles.text}>
              Verificado em {verifiedOn(website.verifiedAt)}.
            </p>
            <Link
              to={`/websites/${website.id}/selo`}
              className={styles.textLink}
            >
              Personalizar e copiar o selo
              <LuArrowRight size='0.875rem' aria-hidden={true} />
            </Link>
          </>
        ) : (
          <VerifyPanel websiteId={website.id} websiteName={website.name} />
        )}
      </section>

      <section className={styles.card} aria-labelledby='website-share-title'>
        <h2 id='website-share-title' className={styles.title}>
          Compartilhar
        </h2>
        <ShareLink title={website.name} url={link} />
      </section>
    </aside>
  )
}

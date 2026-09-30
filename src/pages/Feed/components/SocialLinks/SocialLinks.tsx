import { SOCIAL_LINKS } from '@/constants/links'
import styles from './SocialLinks.module.scss'

export function SocialLinks() {
  if (SOCIAL_LINKS.length === 0) return null

  return (
    <ul className={styles.list}>
      {SOCIAL_LINKS.map(({ label, href, Icon }) => (
        <li key={label}>
          <a
            className={styles.link}
            href={href}
            aria-label={label}
            title={label}
            target={href.startsWith('mailto:') ? undefined : '_blank'}
            rel='noopener noreferrer'
          >
            <Icon size={18} aria-hidden />
          </a>
        </li>
      ))}
    </ul>
  )
}

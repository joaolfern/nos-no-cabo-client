import type { IconType } from 'react-icons'
import { FaGithub, FaTwitter } from 'react-icons/fa6'
import { MdOutlineMail } from 'react-icons/md'
import { CONTACT_EMAIL, GITHUB_URL, TWITTER_URL } from '@/config/env'

export type SocialLink = {
  label: string
  href: string
  Icon: IconType
}

// Links without a configured target are left out instead of pointing nowhere.
export const SOCIAL_LINKS: SocialLink[] = [
  { label: 'GitHub', href: GITHUB_URL, Icon: FaGithub },
  { label: 'Twitter', href: TWITTER_URL ?? '', Icon: FaTwitter },
  {
    label: 'Contato por e-mail',
    href: CONTACT_EMAIL ? `mailto:${CONTACT_EMAIL}` : '',
    Icon: MdOutlineMail,
  },
].filter((link) => Boolean(link.href))

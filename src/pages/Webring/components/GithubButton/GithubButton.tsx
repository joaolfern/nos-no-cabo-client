import { DiGithubBadge } from 'react-icons/di'
import styles from './GithubButton.module.scss'

interface GithubButtonProps {
  repo: string | undefined
}

export function GithubButton({ repo }: GithubButtonProps) {
  if (!repo) {
    return null
  }

  return (
    <a
      className={styles.githubButton}
      href={repo}
      target='_blank'
      rel='noopener noreferrer'
    >
      <DiGithubBadge />
      Ver no GitHub
    </a>
  )
}

import { LuGithub } from 'react-icons/lu'
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
      <LuGithub aria-hidden={true} />
      Ver no GitHub
    </a>
  )
}

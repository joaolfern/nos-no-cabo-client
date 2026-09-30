import { useState } from 'react'
import clsx from 'clsx'
import { LuThumbsDown, LuThumbsUp } from 'react-icons/lu'
import { formatCompactNumber } from '@/utils/formatCompactNumber/formatCompactNumber'
import styles from './WebsiteVotes.module.scss'

type Vote = 'up' | 'down' | null

interface WebsiteVotesProps {
  initialLikes?: number
  initialDislikes?: number
}

// No voting endpoint exists yet, so this only tracks the visitor's own click
// locally — nothing is persisted or sent anywhere.
export function WebsiteVotes({
  initialLikes = 0,
  initialDislikes = 0,
}: WebsiteVotesProps) {
  const [vote, setVote] = useState<Vote>(null)

  const likes = initialLikes + (vote === 'up' ? 1 : 0)
  const dislikes = initialDislikes + (vote === 'down' ? 1 : 0)

  function toggleVote(next: Vote) {
    setVote((current) => (current === next ? null : next))
  }

  return (
    <div className={styles.container}>
      <button
        type='button'
        className={clsx(styles.button, { [styles.active]: vote === 'up' })}
        title='Gostei'
        aria-pressed={vote === 'up'}
        onClick={() => toggleVote('up')}
      >
        <LuThumbsUp size='1rem' />
        <span className={styles.count}>{formatCompactNumber(likes)}</span>
      </button>
      <span className={styles.divider} />
      <button
        type='button'
        className={clsx(styles.button, { [styles.active]: vote === 'down' })}
        title='Não gostei'
        aria-pressed={vote === 'down'}
        onClick={() => toggleVote('down')}
      >
        <LuThumbsDown size='1rem' />
        <span className={styles.count}>{formatCompactNumber(dislikes)}</span>
      </button>
    </div>
  )
}

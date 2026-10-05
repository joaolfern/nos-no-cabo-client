import { useCallback, useRef, useState } from 'react'
import clsx from 'clsx'
import { LuThumbsDown, LuThumbsUp } from 'react-icons/lu'
import { TurnstileField } from '@/components/TurnstileField/TurnstileField'
import { TURNSTILE_SITE_KEY } from '@/config/env'
import { useMessage } from '@/contexts/useMessage'
import type { IVoteValue } from '@/interfaces/IWebsiteStats'
import { useVoteWebsite } from '@/pages/Website/hooks/useVoteWebsite'
import { useWebsiteStats } from '@/pages/Website/hooks/useWebsiteStats'
import { getStoredVote, storeVote } from '@/pages/Website/utils/voterStorage'
import { formatCompactNumber } from '@/utils/formatCompactNumber/formatCompactNumber'
import styles from './WebsiteVotes.module.scss'

interface WebsiteVotesProps {
  websiteId: string
}

const countOf = (vote: IVoteValue, side: 1 | -1) => (vote === side ? 1 : 0)

export function WebsiteVotes({ websiteId }: WebsiteVotesProps) {
  const { data: stats } = useWebsiteStats(websiteId)
  const { mutate: vote } = useVoteWebsite(websiteId)
  const { showMessage } = useMessage()
  const [savedVote, setSavedVote] = useState(() => getStoredVote(websiteId))
  const [pendingVote, setPendingVote] = useState<IVoteValue | null>(null)
  const pendingRef = useRef<IVoteValue | null>(null)

  const shownVote = pendingVote ?? savedVote
  const likes =
    (stats?.likes ?? 0) - countOf(savedVote, 1) + countOf(shownVote, 1)
  const dislikes =
    (stats?.dislikes ?? 0) - countOf(savedVote, -1) + countOf(shownVote, -1)

  const send = useCallback(
    (value: IVoteValue, turnstileToken: string | null) => {
      vote(
        { value, turnstileToken },
        {
          onSuccess: () => {
            storeVote(websiteId, value)
            setSavedVote(value)
          },
          onError: () =>
            showMessage('Não foi possível registrar seu voto. Tente de novo.'),
          onSettled: () => {
            pendingRef.current = null
            setPendingVote(null)
          },
        }
      )
    },
    [vote, websiteId, showMessage]
  )

  const handleToken = useCallback(
    (token: string | null) => {
      const value = pendingRef.current
      if (token && value !== null) send(value, token)
    },
    [send]
  )

  function choose(side: 1 | -1) {
    const value: IVoteValue = savedVote === side ? 0 : side
    pendingRef.current = value
    setPendingVote(value)
    if (!TURNSTILE_SITE_KEY) send(value, null)
  }

  const isPending = pendingVote !== null

  return (
    <div className={styles.wrapper}>
      <div className={styles.container} aria-busy={isPending}>
        <button
          type='button'
          className={clsx(styles.button, { [styles.active]: shownVote === 1 })}
          title='Gostei'
          aria-pressed={shownVote === 1}
          disabled={isPending}
          onClick={() => choose(1)}
        >
          <LuThumbsUp size='1rem' />
          <span className={styles.count}>{formatCompactNumber(likes)}</span>
        </button>
        <span className={styles.divider} />
        <button
          type='button'
          className={clsx(styles.button, {
            [styles.active]: shownVote === -1,
          })}
          title='Não gostei'
          aria-pressed={shownVote === -1}
          disabled={isPending}
          onClick={() => choose(-1)}
        >
          <LuThumbsDown size='1rem' />
          <span className={styles.count}>{formatCompactNumber(dislikes)}</span>
        </button>
      </div>
      {TURNSTILE_SITE_KEY && isPending && (
        <TurnstileField
          siteKey={TURNSTILE_SITE_KEY}
          appearance='interaction-only'
          onTokenChange={handleToken}
        />
      )}
    </div>
  )
}

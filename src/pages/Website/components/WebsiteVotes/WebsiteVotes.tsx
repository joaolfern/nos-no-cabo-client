import { useCallback, useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { LuThumbsDown, LuThumbsUp } from 'react-icons/lu'
import { loadTurnstile } from '@/components/TurnstileField/loadTurnstile'
import { TurnstileField } from '@/components/TurnstileField/TurnstileField'
import { TURNSTILE_SITE_KEY } from '@/config/env'
import { useMessage } from '@/contexts/useMessage'
import type { IVoteValue } from '@/interfaces/IWebsiteStats'
import { useVoteWebsite } from '@/pages/Website/hooks/useVoteWebsite'
import { useWebsiteStats } from '@/pages/Website/hooks/useWebsiteStats'
import {
  clearPendingVote,
  getPendingVote,
  getStoredVote,
  storePendingVote,
} from '@/pages/Website/utils/voterStorage'
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
  const [pendingVote, setPendingVote] = useState(() =>
    getPendingVote(websiteId)
  )
  const [challengeRound, setChallengeRound] = useState(0)
  const pendingRef = useRef(pendingVote)
  const isSendingRef = useRef(false)

  const shownVote = pendingVote ?? savedVote
  const isLoadingStats = stats === undefined

  // Blank while loading and "–" when metrics are down, never a misleading 0.
  function countLabel(side: 1 | -1) {
    if (isLoadingStats) return ''
    if (stats === null) return '–'
    const total = side === 1 ? stats.likes : stats.dislikes
    return formatCompactNumber(
      total - countOf(savedVote, side) + countOf(shownVote, side)
    )
  }

  const clearPending = useCallback(() => {
    pendingRef.current = null
    setPendingVote(null)
  }, [])

  const send = useCallback(
    (value: IVoteValue, turnstileToken: string | null) => {
      if (isSendingRef.current) return
      isSendingRef.current = true
      vote(
        { value, turnstileToken },
        {
          onSuccess: () => setSavedVote(value),
          onError: () => {
            pendingRef.current = null
            clearPendingVote(websiteId)
            showMessage('Não foi possível registrar seu voto. Tente de novo.', {
              tone: 'error',
            })
          },
          onSettled: () => {
            isSendingRef.current = false
            const next = pendingRef.current
            if (next === null || next === value) return clearPending()
            setChallengeRound((round) => round + 1)
          },
        }
      )
    },
    [vote, websiteId, showMessage, clearPending]
  )

  const handleToken = useCallback(
    (token: string | null) => {
      const value = pendingRef.current
      if (token && value !== null) send(value, token)
    },
    [send]
  )

  useEffect(() => {
    const value = pendingRef.current
    if (!TURNSTILE_SITE_KEY && value !== null) send(value, null)
  }, [send, challengeRound])

  function choose(side: 1 | -1) {
    const value: IVoteValue = shownVote === side ? 0 : side
    if (value === savedVote && !isSendingRef.current) {
      clearPendingVote(websiteId)
      return clearPending()
    }
    pendingRef.current = value
    setPendingVote(value)
    storePendingVote(websiteId, value)
    if (!TURNSTILE_SITE_KEY) send(value, null)
  }

  function warmUpTurnstile() {
    if (TURNSTILE_SITE_KEY) loadTurnstile().catch(() => undefined)
  }

  const isPending = pendingVote !== null

  return (
    <div className={styles.wrapper}>
      <div className={styles.container} aria-busy={isLoadingStats}>
        <button
          type='button'
          className={clsx(styles.button, { [styles.active]: shownVote === 1 })}
          title='Gostei'
          aria-pressed={shownVote === 1}
          disabled={isLoadingStats}
          onPointerDown={warmUpTurnstile}
          onClick={() => choose(1)}
        >
          <LuThumbsUp size='1rem' />
          <span className={styles.count}>{countLabel(1)}</span>
        </button>
        <span className={styles.divider} />
        <button
          type='button'
          className={clsx(styles.button, {
            [styles.active]: shownVote === -1,
          })}
          title='Não gostei'
          aria-pressed={shownVote === -1}
          disabled={isLoadingStats}
          onPointerDown={warmUpTurnstile}
          onClick={() => choose(-1)}
        >
          <LuThumbsDown size='1rem' />
          <span className={styles.count}>{countLabel(-1)}</span>
        </button>
      </div>
      {TURNSTILE_SITE_KEY && isPending && (
        <TurnstileField
          key={challengeRound}
          siteKey={TURNSTILE_SITE_KEY}
          appearance='interaction-only'
          onTokenChange={handleToken}
        />
      )}
    </div>
  )
}

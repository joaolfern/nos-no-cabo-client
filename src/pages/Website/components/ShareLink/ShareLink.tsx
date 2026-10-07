import { useEffect, useRef, useState } from 'react'
import { LuCheck, LuCopy, LuShare2 } from 'react-icons/lu'
import styles from './ShareLink.module.scss'

const COPIED_FEEDBACK_MS = 2000

const canShare = () => typeof navigator.share === 'function'

const isCancelled = (error: unknown) =>
  error instanceof DOMException && error.name === 'AbortError'

interface ShareLinkProps {
  title: string
  url: string
}

export function ShareLink({ title, url }: ShareLinkProps) {
  const [isCopied, setIsCopied] = useState(false)
  const timeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timeoutRef.current), [])

  async function copy() {
    await navigator.clipboard.writeText(url)
    setIsCopied(true)
    window.clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(
      () => setIsCopied(false),
      COPIED_FEEDBACK_MS
    )
  }

  async function share() {
    try {
      await navigator.share({ title, url })
    } catch (error) {
      if (!isCancelled(error)) throw error
    }
  }

  const CopyIcon = isCopied ? LuCheck : LuCopy

  return (
    <div className={styles.container}>
      <button
        type='button'
        className={styles.copy}
        onClick={copy}
        aria-live='polite'
      >
        <CopyIcon aria-hidden={true} />
        {isCopied ? 'Link copiado' : 'Copiar link'}
      </button>
      {canShare() && (
        <button
          type='button'
          className={styles.share}
          onClick={share}
          aria-label='Enviar para…'
          title='Enviar para…'
        >
          <LuShare2 aria-hidden={true} />
        </button>
      )}
    </div>
  )
}

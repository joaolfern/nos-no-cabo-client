import { useEffect, useId, useState } from 'react'
import { LuCheck, LuChevronDown, LuCopy } from 'react-icons/lu'
import { Button } from '@/components/Button/Button'
import styles from './SnippetCode.module.scss'

const COPIED_FEEDBACK_MS = 2000

type SnippetCodeProps = {
  code: string
  locked?: boolean
  lockedReasonId?: string
}

export function SnippetCode({
  code,
  locked,
  lockedReasonId,
}: SnippetCodeProps) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const codeId = useId()

  useEffect(() => {
    if (!copied) return
    const timeout = window.setTimeout(
      () => setCopied(false),
      COPIED_FEEDBACK_MS
    )
    return () => window.clearTimeout(timeout)
  }, [copied])

  async function copy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
  }

  const isOpen = expanded && !locked

  return (
    <section className={styles.code} aria-label='Código do selo'>
      <div className={styles.bar}>
        <span>HTML para colar no seu site</span>
        <div
          className={styles.actions}
          aria-describedby={locked ? lockedReasonId : undefined}
        >
          <Button
            type='button'
            variant='outline'
            className={styles.action}
            aria-expanded={isOpen}
            aria-controls={codeId}
            disabled={locked}
            onClick={() => setExpanded((current) => !current)}
          >
            <LuChevronDown
              aria-hidden
              className={isOpen ? styles.chevronOpen : undefined}
            />
            {isOpen ? 'Ocultar código' : 'Ver código'}
          </Button>
          <Button
            type='button'
            className={styles.action}
            disabled={locked}
            onClick={copy}
          >
            {copied ? <LuCheck aria-hidden /> : <LuCopy aria-hidden />}
            {copied ? 'Copiado' : 'Copiar código'}
          </Button>
        </div>
      </div>
      <pre id={codeId} className={styles.pre} hidden={!isOpen}>
        <code>{code}</code>
      </pre>
    </section>
  )
}

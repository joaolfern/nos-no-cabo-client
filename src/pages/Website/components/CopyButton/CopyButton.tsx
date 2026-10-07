import { useEffect, useRef, useState } from 'react'
import { LuCheck, LuCopy } from 'react-icons/lu'
import { Button } from '@/components/Button/Button'
import styles from './CopyButton.module.scss'

const COPIED_FEEDBACK_MS = 2000

interface CopyButtonProps {
  text: string
  label: string
}

export function CopyButton({ text, label }: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false)
  const timeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timeoutRef.current), [])

  async function copy() {
    await navigator.clipboard.writeText(text)
    setIsCopied(true)
    window.clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(
      () => setIsCopied(false),
      COPIED_FEEDBACK_MS
    )
  }

  const Icon = isCopied ? LuCheck : LuCopy

  return (
    <Button
      type='button'
      variant='outline'
      small={true}
      className={styles.copyButton}
      onClick={copy}
      aria-live='polite'
    >
      <Icon size='0.875rem' aria-hidden={true} />
      {isCopied ? 'Copiado!' : label}
    </Button>
  )
}

import { MdCheck, MdCopyAll } from 'react-icons/md'
import styles from './Copyable.module.scss'
import clsx from 'clsx'
import { useState, useRef, useEffect } from 'react'

type CopyableProps = React.JSX.IntrinsicElements['span'] & {
  text: string
}

export function Copyable({ text, className, ...props }: CopyableProps) {
  const [isCopied, setIsCopied] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  function handleClick() {
    navigator.clipboard.writeText(text)
    setIsCopied(true)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = window.setTimeout(() => setIsCopied(false), 2000)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <span
      className={clsx(styles.copyable, className)}
      {...props}
      onClick={handleClick}
      title='Clique para copiar'
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      role='button'
      tabIndex={0}
      aria-label={isCopied ? 'Copiado!' : 'Clique para copiar'}
    >
      {isCopied ? (
        <>
          Copiado!
          <MdCheck size={18} />
        </>
      ) : (
        <>
          {text}
          <MdCopyAll size={18} />
        </>
      )}
    </span>
  )
}

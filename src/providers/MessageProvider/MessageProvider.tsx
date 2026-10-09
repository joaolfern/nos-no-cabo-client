import { Message } from '@/components/Message/Message'
import { Portal } from '@/components/Portal/Portal'
import { MessageContext } from '@/contexts/MessageContext'
import type { MessageContextProps } from '@/interfaces/IMessage'
import { handleMessageQueueUpdate } from '@/providers/MessageProvider/utils/handleMessageQueueUpdate'
import { useCallback, useEffect, useReducer, useRef } from 'react'
import styles from './MessageProvider.module.scss'

const MESSAGE_DURATION_MS = 4000

type IMessageProviderProps = {
  children: React.ReactNode
}

export function MessageProvider({ children }: IMessageProviderProps) {
  const [messageQueue, dispatch] = useReducer(handleMessageQueueUpdate, [])

  const timersRef = useRef<
    Array<{ id: string; timer: ReturnType<typeof setTimeout> }>
  >([])

  const hideMessage: MessageContextProps['hideMessage'] = useCallback((id) => {
    dispatch({ type: 'leave', id })
    timersRef.current = timersRef.current.filter((timer) => {
      return timer.id !== id
    })
  }, [])

  const removeMessage = useCallback((id: string) => {
    dispatch({ type: 'remove', id })
  }, [])

  const showMessage: MessageContextProps['showMessage'] = useCallback(
    (label, options) => {
      const id = label || Date.now().toString()

      dispatch({
        type: 'show',
        item: { visible: true, label, id, tone: options?.tone ?? 'info' },
      })

      const timer = setTimeout(() => {
        hideMessage(id)
      }, MESSAGE_DURATION_MS)

      timersRef.current.push({ id, timer })

      return id
    },
    [hideMessage]
  )

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => {
        clearTimeout(timer.timer)
      })
    }
  }, [])

  const value: MessageContextProps = {
    showMessage,
    hideMessage,
  }

  return (
    <MessageContext.Provider value={value}>
      {children}
      <Portal container={document.body}>
        <div className={styles.list} role='status' aria-live='polite'>
          {messageQueue.map((item) => (
            <Message
              key={item.id}
              id={item.id}
              label={item.label}
              tone={item.tone}
              visible={item.visible}
              onDismiss={() => hideMessage(item.id)}
              onLeft={() => removeMessage(item.id)}
            />
          ))}
        </div>
      </Portal>
    </MessageContext.Provider>
  )
}

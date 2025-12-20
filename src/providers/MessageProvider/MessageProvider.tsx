import { Message } from '@/components/Message/Message'
import { Portal } from '@/components/Portal/Portal'
import { MessageContext } from '@/contexts/MessageContext'
import type { MessageContextProps } from '@/interfaces/IMessage'
import { handleMessageQueueUpdate } from '@/providers/MessageProvider/utils/handleMessageQueueUpdate'
import { useCallback, useEffect, useReducer, useRef } from 'react'
import styles from './MessageProvider.module.scss'

type IMessageProviderProps = {
  children: React.ReactNode
}

export function MessageProvider({ children }: IMessageProviderProps) {
  const [messageQueue, setMessageQueue] = useReducer(
    handleMessageQueueUpdate,
    []
  )

  const timersRef = useRef<
    Array<{ id: string; timer: ReturnType<typeof setTimeout> }>
  >([])

  const hideMessage: MessageContextProps['hideMessage'] = useCallback((id) => {
    setMessageQueue(id)
    timersRef.current = timersRef.current.filter((timer) => {
      return timer.id !== id
    })
  }, [])

  const showMessage: MessageContextProps['showMessage'] = useCallback(
    (label) => {
      const id = label || Date.now().toString()

      setMessageQueue({
        visible: true,
        label,
        id,
      })

      const timer = setTimeout(() => {
        hideMessage(id)
      }, 3000)

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

  const onDismiss = useCallback(() => {
    hideMessage()
  }, [hideMessage])

  return (
    <MessageContext.Provider value={value}>
      {children}
      <Portal container={document.body}>
        <div className={styles.list}>
          {messageQueue.map((item) => (
            <Message
              key={item.id}
              id={item.id}
              onDismiss={onDismiss}
              label={item.label}
              visible={item.visible}
            />
          ))}
        </div>
      </Portal>
    </MessageContext.Provider>
  )
}

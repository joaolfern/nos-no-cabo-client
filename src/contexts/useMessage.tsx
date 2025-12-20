import { MessageContext } from '@/contexts/MessageContext'
import type { MessageContextProps } from '@/interfaces/IMessage'
import { useContext } from 'react'

export function useMessage() {
  const context = useContext<MessageContextProps>(MessageContext)

  if (!context) {
    throw new Error('useMessage must be used within a MessageProvider')
  }

  return context
}

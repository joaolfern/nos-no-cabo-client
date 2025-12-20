import type { MessageContextProps } from '@/interfaces/IMessage'
import { createContext } from 'react'

const defaultMessageProps: MessageContextProps = {
  hideMessage: () => {},
  showMessage: () => '',
}

export const MessageContext =
  createContext<MessageContextProps>(defaultMessageProps)

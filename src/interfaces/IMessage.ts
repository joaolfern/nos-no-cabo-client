export type MessageTone = 'info' | 'success' | 'error'

export interface IMessageAction {
  label: string
  onPress: () => void
}

export interface IMessageOptions {
  tone?: MessageTone
  action?: IMessageAction
  persistent?: boolean
}

export interface MessageContextProps {
  showMessage: (label: string, options?: IMessageOptions) => string
  hideMessage: (id?: string) => void
}

export type IMessageQueueAction =
  | { type: 'show'; item: IMessageItem }
  | { type: 'leave'; id?: string }
  | { type: 'remove'; id: string }

export interface IMessageItem {
  label: string
  visible: boolean
  id: string
  tone: MessageTone
  onDismiss?: () => void
  action?: IMessageAction
}

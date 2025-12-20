export interface MessageContextProps {
  showMessage: (label: string) => string
  hideMessage: (id?: string) => void
}

export type IMessageQueueAction = IMessageItem | IMessageItem['id'] | undefined

export interface IMessageItem {
  label: string
  visible: boolean
  id: string
  onDismiss?: () => void
  action?: {
    label: string
    onPress: () => void
  }
}

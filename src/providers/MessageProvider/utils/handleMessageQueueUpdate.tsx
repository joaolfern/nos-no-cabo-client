import type { IMessageItem, IMessageQueueAction } from '@/interfaces/IMessage'

export const handleMessageQueueUpdate = (
  state: IMessageItem[],
  action: IMessageQueueAction
): IMessageItem[] => {
  if (typeof action === 'object') {
    const idExists = state.some((item) => item.id === action.id)

    if (idExists) return state

    return [...state, action]
  } else {
    if (action === undefined) {
      return state.slice(1)
    }

    return state.filter((item) => item.id !== action)
  }
}

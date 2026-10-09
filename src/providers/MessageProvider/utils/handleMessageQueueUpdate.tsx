import type { IMessageItem, IMessageQueueAction } from '@/interfaces/IMessage'

function leave(state: IMessageItem[], id: string | undefined) {
  const leavingId = id ?? state.find((item) => item.visible)?.id
  return state.map((item) =>
    item.id === leavingId ? { ...item, visible: false } : item
  )
}

export const handleMessageQueueUpdate = (
  state: IMessageItem[],
  action: IMessageQueueAction
): IMessageItem[] => {
  switch (action.type) {
    case 'show':
      if (state.some((item) => item.id === action.item.id)) return state
      return [...state, action.item]
    case 'leave':
      return leave(state, action.id)
    case 'remove':
      return state.filter((item) => item.id !== action.id)
  }
}

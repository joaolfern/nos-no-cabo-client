import type { ReactNode } from 'react'

export type CommonProps = React.JSX.IntrinsicElements['div'] & {
  position?: 'left' | 'right' | 'topLeft'
  popup: ReactNode
}

export type PopupProps = CommonProps & {
  container?: HTMLElement | null
  classNames?: {
    trigger?: string
    panel?: string
  }
  popupRef?: React.Ref<PopupRef | undefined>
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  toggle: () => void
}

export type PopupRef = {
  setIsOpen: (open: boolean) => void
  isOpen: boolean
}

export type PanelProps = CommonProps & {
  isOpen: boolean
}

export type DialogProps = {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  container?: HTMLElement | null
  title: string
  onConfirm: () => void
  onCancel: () => void
}

import { createPortal } from 'react-dom'

type PortalProps = {
  container: HTMLElement | null | undefined
  children: React.ReactNode
}

export function Portal({ container, children }: PortalProps) {
  if (!container) return null

  return createPortal(children, container)
}

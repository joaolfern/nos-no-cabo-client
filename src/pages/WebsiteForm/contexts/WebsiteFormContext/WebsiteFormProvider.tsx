import { WebsiteFormContext } from './WebsiteFormContext'
import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { WebsiteFormContextProps } from '../../WebsiteForm.types'

type WebsiteFormProviderProps = {
  children: ReactNode
}

export function WebsiteFormProvider({ children }: WebsiteFormProviderProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  const handleCreate = useCallback(() => {
    setIsOpen(true)
  }, [])

  const handleSuccess = useCallback(() => {
    setIsOpen(false)
  }, [])

  const value: WebsiteFormContextProps = useMemo(
    () => ({
      handleClose,
      handleCreate,
      handleSuccess,
      isOpen,
    }),
    [handleClose, handleCreate, handleSuccess, isOpen]
  )

  return (
    <WebsiteFormContext.Provider value={value}>
      {children}
    </WebsiteFormContext.Provider>
  )
}

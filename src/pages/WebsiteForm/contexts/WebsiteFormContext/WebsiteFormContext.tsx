import { createContext } from 'react'
import type { WebsiteFormContextProps } from '../../WebsiteForm.types'

export const WebsiteFormContext = createContext<WebsiteFormContextProps>({
  handleClose: () => {},
  handleCreate: () => {},
  handleSuccess: () => {},
  isOpen: false,
})

import { IconContext } from 'react-icons'

type IconProviderProps = {
  children: React.ReactNode
}

const config: IconContext = {
  style: {
    verticalAlign: 'middle',
  },
  size: '1.5rem',
}

export function IconProvider({ children }: IconProviderProps) {
  return <IconContext.Provider value={config}>{children}</IconContext.Provider>
}

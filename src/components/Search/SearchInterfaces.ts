import type { RefObject } from 'react'

export type ISearchOption = {
  title?: string
  description: string
  value: string
}

export type SearchProps = Omit<React.ComponentProps<'input'>, 'onChange'> & {
  classNames?: {
    contentFocused?: string
  }
  onChange?: (query: string) => void
  options?: ISearchOption[]
  value?: string
  container?: RefObject<HTMLElement | null>
}

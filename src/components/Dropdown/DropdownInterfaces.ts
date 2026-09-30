import type { ReactNode } from 'react'
import type { IconType } from 'react-icons'

export type DropdownOption<T> = {
  label: string
  value: T
  Icon?: IconType
  endContent?: ReactNode
}

export type ValueType<T, M extends boolean | undefined> = M extends true
  ? T[]
  : T

export type DropdownPosition = 'left' | 'right'

export type DropdownProps<T, M extends boolean | undefined> = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onChange'
> & {
  options: DropdownOption<T>[]
  value: ValueType<T, M>
  onChange: (value: T) => void
  multiple?: M
  // 'left' opens toward the left (right edges aligned), 'right' the opposite.
  position?: DropdownPosition
  loading?: boolean
  classNames?: {
    trigger?: string
    panel?: string
  }
}

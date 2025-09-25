import type { MenuProps } from '@/components/Menu/MenuInterfaces'

export type DropdownOption<T> = {
  label: string
  value: T
}

export type ValueType<T, M extends boolean | undefined> = M extends true
  ? T[]
  : T

export type CommonProps<T, M extends boolean | undefined> = Omit<
  MenuProps,
  'onChange'
> & {
  options?: DropdownOption<T>[]
  position?: 'left' | 'right'
  multiple?: M
  value: ValueType<T, M>
}

export type DropdownProps<T, M extends boolean | undefined> = CommonProps<
  T,
  M
> & {
  options: DropdownOption<T>[]
  onChange: (value: T) => void
  container?: HTMLElement | null
  classNames?: {
    trigger?: string
    panel?: string
  }
}

export type PanelProps<T, M extends boolean | undefined = false> = CommonProps<
  T,
  M
> & {
  isOpen: boolean
  handleChange: (value: T) => void
}

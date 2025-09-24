import type { DropdownProps } from '@/components/Dropdown/DropdownInterfaces'
import type { IconType } from 'react-icons'

export type DropdownTextProps<T, M extends boolean | undefined> = Omit<
  DropdownProps<T, M>,
  'classNames'
> & {
  Icon: IconType
  valueLabel: string
  classNames?: {
    content?: string
    text?: string
  } & Partial<DropdownProps<T, M>['classNames']>
}

import type { DropdownProps } from '@/components/Dropdown/DropdownInterfaces'

export type DropdownButtonProps<T, M extends boolean | undefined> = Omit<
  DropdownProps<T, M>,
  'classNames' | 'children'
> & {
  label: string
  labelOfSelected: string | undefined
  loading: boolean
  classNames?: {
    content?: string
    text?: string
  } & Partial<DropdownProps<T, M>['classNames']>
}

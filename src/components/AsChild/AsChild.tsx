import React from 'react'

type AsChildProps<T> = {
  children: React.ReactNode
  props: T
}

export function AsChild<T extends Partial<T> & React.Attributes>({
  children,
  props,
}: AsChildProps<T>) {
  return React.cloneElement(children as React.ReactElement<T>, {
    ...props,
  })
}

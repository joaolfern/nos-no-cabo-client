import React from 'react'
import type { IQueryEventValues } from '@/interfaces/ICustomEvents'
import { AsChild } from '@/components/AsChild/AsChild'

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  query: IQueryEventValues['query']
  asChild?: boolean
}
export function Link({
  query,
  asChild,
  children,
  ...props
}: LinkProps & { children?: React.ReactNode }) {
  function handleClick(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
    const url = new URL(window.location.href)

    for (const key in query) {
      const value = query[key]
      if (value) {
        url.searchParams.set(key, value)
      } else {
        url.searchParams.delete(key)
      }
    }

    if (e.ctrlKey) {
      ;(e.target as HTMLAnchorElement).href = url.toString()
      return
    }

    const detail: IQueryEventValues = { query }
    ;(e.target as HTMLAnchorElement).href = url.toString()
    e.preventDefault()

    window.dispatchEvent(new CustomEvent('query-change', { detail }))
    window.history.pushState({}, '', url)
  }

  if (asChild && React.isValidElement(children)) {
    return (
      <AsChild
        props={{
          onClick: handleClick,
          ...props,
        }}
      >
        {children}
      </AsChild>
    )
  }

  return (
    <a href={'#'} {...props} onClick={handleClick}>
      {children}
    </a>
  )
}

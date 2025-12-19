import React from 'react'
import {
  Link as RouterLink,
  type LinkProps as RouterLinkProps,
} from 'react-router'

type LinkProps = RouterLinkProps

export function Link({
  children,
  ...props
}: LinkProps & { children?: React.ReactNode }) {
  return <RouterLink {...props}>{children}</RouterLink>
}

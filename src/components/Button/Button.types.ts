export type _buttonVariant = 'primary' | 'secondary' | 'tertiary' | 'outline'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: _buttonVariant
  small?: boolean
  asChild?: boolean
  ref?: React.Ref<HTMLButtonElement>
}

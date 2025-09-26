export type _buttonVariant = 'primary' | 'secondary' | 'tertiary'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: _buttonVariant
  small?: boolean
  asChild?: boolean
}

export type AppLayoutVariant = 'wide' | 'focused'

export type AppLayoutProps = React.JSX.IntrinsicElements['section'] & {
  children: React.ReactNode
  variant?: AppLayoutVariant
}

export type ImageProps = React.JSX.IntrinsicElements['img'] & {
  fallback?: React.JSX.IntrinsicElements['img']['src']
  avatar?: boolean
}

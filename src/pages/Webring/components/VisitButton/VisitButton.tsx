import { MdOpenInNew } from 'react-icons/md'
import styles from './VisitButton.module.scss'
import { clsx } from 'clsx'

type VisitButtonProps = React.JSX.IntrinsicElements['a'] & {
  url: string
}

export function VisitButton({
  url,
  children,
  className,
  ...props
}: VisitButtonProps) {
  return (
    <a
      className={clsx(styles.visitButton, className)}
      href={url}
      target='_blank'
      rel='noopener noreferrer'
      {...props}
    >
      {children}
      <MdOpenInNew />
    </a>
  )
}

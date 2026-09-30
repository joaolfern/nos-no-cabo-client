import clsx from 'clsx'
import styles from './Textarea.module.scss'

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  ref?: React.Ref<HTMLTextAreaElement>
}

export function Textarea({ className, ref, ...props }: TextareaProps) {
  return (
    <textarea
      className={clsx(styles.textarea, className)}
      ref={ref}
      {...props}
    />
  )
}

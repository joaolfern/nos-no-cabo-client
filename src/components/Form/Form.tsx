import clsx from 'clsx'
import styles from './Form.module.scss'

type FormProps<T> = Omit<React.JSX.IntrinsicElements['form'], 'onSubmit'> & {
  onSubmit: (values: T) => void
}

export function Form<T>(props: FormProps<T>) {
  const { onSubmit, className, ...rest } = props

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (onSubmit) {
      const values = new FormData(e.currentTarget)
      const data = Object.fromEntries(values) as unknown as T

      onSubmit(data)
    }
  }

  return (
    <form
      {...rest}
      onSubmit={handleSubmit}
      className={clsx(styles.form, className)}
    />
  )
}

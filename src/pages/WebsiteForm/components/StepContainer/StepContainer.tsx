import clsx from 'clsx'
import styles from './StepContainer.module.scss'

type StepContainerProps = React.JSX.IntrinsicElements['div']

export function StepContainer({ className, ...props }: StepContainerProps) {
  return <div className={clsx(className, styles.stepContainer)} {...props} />
}

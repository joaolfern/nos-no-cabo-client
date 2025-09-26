import type { TypographyProps } from '@/components/Typography/TypographyTypes'
import styles from './StepDescription.module.scss'
import { Typography } from '@/components/Typography/Typography'
import clsx from 'clsx'

type StepDescriptionProps = Partial<TypographyProps>

export function StepDescription({ className, ...props }: StepDescriptionProps) {
  return (
    <Typography
      className={clsx(styles.description, className)}
      variant='bodySmall'
      asVariant={true}
      {...props}
    />
  )
}

import { Typography } from '@/components/Typography/Typography'
import { NOS_NO_CABO_URL } from '@/config/env'
import { Copyable } from '@/components/Copyable/Copyable'
import { StepContainer } from '@/pages/WebsiteForm/components/StepContainer/StepContainer'
import type { StepComponentProps } from '@/pages/WebsiteForm/_WebsiteFormProps'
import { StepDescription } from '@/pages/WebsiteForm/components/StepDescription/StepDescription'
import { ConfirmButton } from '@/pages/WebsiteForm/components/ConfirmButton/ConfirmButton'
import styles from './InitialStep.module.scss'

export function InitialStep({ updateStep }: StepComponentProps) {
  return (
    <StepContainer>
      <Typography variant='h3' asVariant={true}>
        Vamos lá!
      </Typography>
      <StepDescription>
        Para seu site ser apresentado aqui, ele precisa conter um link para
        nosso site:{' '}
      </StepDescription>
      <Typography className={styles.url} variant='caption'>
        <Copyable text={NOS_NO_CABO_URL} />
      </Typography>

      <ConfirmButton onClick={() => updateStep(1)} />
    </StepContainer>
  )
}

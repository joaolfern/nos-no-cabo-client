import { Typography } from '@/components/Typography/Typography'
import type { IPreregisterWebsite } from '@/interfaces/IWebsite'
import { EditableText } from '@/components/Editable/EditableText'
import { EditableColor } from '@/components/Editable/EditableColor'
import { StepTitle } from '@/pages/WebsiteForm/components/StepTitle/StepTitle'
import type { StepComponentProps } from '@/pages/WebsiteForm/_WebsiteFormProps'
import { StepContainer } from '@/pages/WebsiteForm/components/StepContainer/StepContainer'
import { ConfirmButton } from '@/pages/WebsiteForm/components/ConfirmButton/ConfirmButton'
import styles from './ReviewStep.module.scss'

export function ReviewStep({
  preregister,
  updateStep,
  setPreregister,
}: StepComponentProps) {
  function handleChange(
    field: keyof IPreregisterWebsite,
    value: string | undefined
  ) {
    setPreregister({
      ...(preregister as IPreregisterWebsite),
      [field]: value,
    })
  }

  function onConfirm() {
    updateStep(3)
  }

  return (
    <StepContainer>
      <StepTitle updateStep={updateStep} text='Revise' index={3} />
      <ReviewItem label='Nome do site'>
        <EditableText
          onSave={(value) => handleChange('name', value)}
          value={preregister?.name}
        />
      </ReviewItem>
      <ReviewItem label='Descrição'>
        <EditableText
          onSave={(value) => handleChange('description', value)}
          value={preregister?.description}
        />
      </ReviewItem>
      <ReviewItem label='Cor'>
        <EditableColor
          onSave={(value) => handleChange('color', value)}
          value={preregister?.color}
        />
      </ReviewItem>
      <ConfirmButton onClick={onConfirm} />
    </StepContainer>
  )
}

type ReviewItemProps = React.JSX.IntrinsicElements['div'] & {
  label: string
}

function ReviewItem({ label, children }: ReviewItemProps) {
  return (
    <div className={styles.reviewItem}>
      <Typography variant='caption' asVariant={true}>
        {label}
      </Typography>
      {children}
    </div>
  )
}

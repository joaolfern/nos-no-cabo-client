import { Typography } from '@/components/Typography/Typography'
import { useEffect } from 'react'
import { Input } from '@/components/Input/Input'
import { usePreregisterWebsite } from '@/hooks/useDataHooks'
import { Form } from '@/components/Form/Form'
import { StepTitle } from '@/pages/WebsiteForm/components/StepTitle/StepTitle'
import type { StepComponentProps } from '@/pages/WebsiteForm/_WebsiteFormProps'
import { StepContainer } from '@/pages/WebsiteForm/components/StepContainer/StepContainer'
import { ConfirmButton } from '@/pages/WebsiteForm/components/ConfirmButton/ConfirmButton'
import { StepDescription } from '@/pages/WebsiteForm/components/StepDescription/StepDescription'

export function PreregisterStep({
  updateStep,
  setPreregister,
}: StepComponentProps) {
  const { mutate, isPending, error, data } = usePreregisterWebsite()

  useEffect(() => {
    if (data) {
      updateStep(2)
      setPreregister(data)
    }
  }, [data, setPreregister, updateStep])

  return (
    <StepContainer>
      <StepTitle updateStep={updateStep} text='Informe sua URL' index={1} />
      <StepDescription>
        Vamos obter as informações necessárias para o seu cadastro.
      </StepDescription>
      <Form<{ url: string }> onSubmit={(values) => mutate(values)}>
        <Input
          name='url'
          placeholder='https://<seusite>.com'
          required={true}
          autoFocus={true}
        />
        {error && (
          <Typography variant='caption'>
            Ocorreu um erro: {error.message}
          </Typography>
        )}
        <ConfirmButton disabled={isPending}>
          {isPending ? 'Buscando...' : 'Buscar'}
        </ConfirmButton>
      </Form>
    </StepContainer>
  )
}

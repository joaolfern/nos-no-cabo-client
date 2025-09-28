import { Input } from '@/components/Input/Input'
import type { IPreregisterWebsite } from '@/interfaces/IWebsite'
import type { StepComponentProps } from '@/pages/WebsiteForm/_WebsiteFormProps'
import { ConfirmButton } from '@/pages/WebsiteForm/components/ConfirmButton/ConfirmButton'
import { StepContainer } from '@/pages/WebsiteForm/components/StepContainer/StepContainer'
import { StepDescription } from '@/pages/WebsiteForm/components/StepDescription/StepDescription'
import { StepTitle } from '@/pages/WebsiteForm/components/StepTitle/StepTitle'
import { useState } from 'react'

export function GithubStep({
  updateStep,
  setPreregister,
  preregister,
}: StepComponentProps) {
  const [repo, setRepo] = useState<string>('')

  function onConfirm() {
    updateStep(4)
    setPreregister({
      ...(preregister as IPreregisterWebsite),
      repo,
    })
  }

  return (
    <StepContainer>
      <StepTitle updateStep={updateStep} text='Palavras-chave' index={2} />
      <StepDescription>
        Se desejar, compartilhe o código fonte do seu site.
      </StepDescription>

      <Input
        placeholder='URL do repositório'
        value={repo}
        onChange={(e) => setRepo(e.target.value)}
      />

      <ConfirmButton onClick={onConfirm} />
    </StepContainer>
  )
}

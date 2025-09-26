import { InputList } from '@/components/Input/InputList'
import { useRegisterWebsite } from '@/hooks/useDataHooks'
import type { IRegisterWebsite } from '@/interfaces/IWebsite'
import type { StepComponentProps } from '@/pages/WebsiteForm/_WebsiteFormProps'
import { ConfirmButton } from '@/pages/WebsiteForm/components/ConfirmButton/ConfirmButton'
import { StepContainer } from '@/pages/WebsiteForm/components/StepContainer/StepContainer'
import { StepDescription } from '@/pages/WebsiteForm/components/StepDescription/StepDescription'
import { StepTitle } from '@/pages/WebsiteForm/components/StepTitle/StepTitle'
import { useState } from 'react'

export function KeywordsStep({
  updateStep,
  preregister,
  onSucess,
}: StepComponentProps) {
  const [keywords, setKeywords] = useState<string[]>([])
  const { mutate, isPending } = useRegisterWebsite()

  function onConfirm() {
    if (!preregister) return

    const formattedKeywords = keywords.filter((k) => k.trim() !== '')
    const website: IRegisterWebsite = {
      ...preregister,
      keywords: formattedKeywords,
    }

    mutate(website, {
      onSuccess: () => {
        onSucess()
      },
    })
  }

  return (
    <StepContainer>
      <StepTitle updateStep={updateStep} text='Palavras-chave' index={2} />
      <StepDescription>
        Nos ajude a classificar seu site adicionando algumas palavras-chave.
      </StepDescription>
      <InputList
        value={keywords}
        onChange={setKeywords}
        placeholder='Adicione uma palavra-chave'
      />
      <ConfirmButton onClick={onConfirm} disabled={isPending}>
        {isPending ? 'Salvando...' : 'Salvar'}
      </ConfirmButton>
    </StepContainer>
  )
}

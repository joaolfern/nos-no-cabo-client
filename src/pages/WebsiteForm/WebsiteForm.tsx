import { useState } from 'react'
import type {
  IPreregisterWebsite,
  IRegisterWebsite,
} from '@/interfaces/IWebsite'
import { InitialStep } from '@/pages/WebsiteForm/components/InitialStep/InitialStep'
import { PreregisterStep } from '@/pages/WebsiteForm/components/PreregisterStep/PreregisterStep'
import { ReviewStep } from '@/pages/WebsiteForm/components/ReviewStep/ReviewStep'
import { KeywordsStep } from '@/pages/WebsiteForm/components/KeywordsStep/KeywordsStep'
import { GithubStep } from '@/pages/WebsiteForm/components/GithubStep/GithubStep'
import { useMessage } from '@/contexts/useMessage'

type WebsiteFormProps = {
  onSuccess?: () => void
}

export function WebsiteForm({ onSuccess }: WebsiteFormProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [preregister, setPreregister] = useState<IPreregisterWebsite | null>(
    null
  )

  const { showMessage } = useMessage()

  const CurrentStep = STEPS[stepIndex]

  function handleSuccess(website: IRegisterWebsite) {
    if (onSuccess) onSuccess()
    setPreregister(null)
    setStepIndex(0)

    showMessage(`"${website.name ?? '-'}" foi adicionado!`)
  }

  return (
    CurrentStep && (
      <CurrentStep
        preregister={preregister}
        setPreregister={setPreregister}
        updateStep={setStepIndex}
        onSuccess={handleSuccess}
      />
    )
  )
}

const STEPS = [
  InitialStep,
  PreregisterStep,
  ReviewStep,
  GithubStep,
  KeywordsStep,
]

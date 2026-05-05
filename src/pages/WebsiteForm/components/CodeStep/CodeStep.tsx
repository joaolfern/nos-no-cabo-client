import { useState } from 'react'
import { MdContentCopy, MdCheck } from 'react-icons/md'
import { Typography } from '@/components/Typography/Typography'
import { Button } from '@/components/Button/Button'
import type { StepComponentProps } from '@/pages/WebsiteForm/WebsiteForm.types'
import { ConfirmButton } from '@/pages/WebsiteForm/components/ConfirmButton/ConfirmButton'
import { StepContainer } from '@/pages/WebsiteForm/components/StepContainer/StepContainer'
import { StepTitle } from '@/pages/WebsiteForm/components/StepTitle/StepTitle'
import styles from './CodeStep.module.scss'

export function CodeStep({ updateStep, bannerCode = '' }: StepComponentProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(bannerCode)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <StepContainer>
      <StepTitle updateStep={updateStep} text='Cole o código' index={1} />

      <div className={styles.callout}>
        <Typography variant='bodySmall' className={styles.calloutTitle}>
          Adicione o badge ao seu site para concluir o cadastro.
        </Typography>
        <Typography variant='bodySmall'>
          Cole o código abaixo no HTML, de preferência no rodapé ou em uma
          página de links.
        </Typography>
      </div>

      <pre className={styles.codeBlock}>{bannerCode}</pre>

      <Button
        onClick={handleCopy}
        type='button'
        small
        className={styles.copyButton}
      >
        {copied ? <MdCheck size={16} /> : <MdContentCopy size={16} />}
        {copied ? 'Copiado!' : 'Copiar código'}
      </Button>

      <ConfirmButton onClick={() => updateStep(2)}>
        Já colei o código
      </ConfirmButton>
    </StepContainer>
  )
}

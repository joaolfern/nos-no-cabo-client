import { useState } from 'react'
import { LuX } from 'react-icons/lu'
import { Button } from '@/components/Button/Button'
import { ChoiceChip } from '@/components/ChoiceChip/ChoiceChip'
import { Field } from '@/components/Field/Field'
import { fieldMessageId } from '@/components/Field/fieldMessageId'
import { Modal } from '@/components/Modal/Modal'
import { Textarea } from '@/components/Textarea/Textarea'
import { TurnstileField } from '@/components/TurnstileField/TurnstileField'
import { TURNSTILE_SITE_KEY } from '@/config/env'
import { useMessage } from '@/contexts/useMessage'
import type { IApiError } from '@/interfaces/IApiError'
import type { IReportReason } from '@/interfaces/IReport'
import { useReportWebsite } from '@/pages/Webring/hooks/useReportWebsite'
import styles from './ReportDialog.module.scss'

const COMMENT_MAX_LENGTH = 500

const REASONS: { value: IReportReason; label: string }[] = [
  { value: 'inappropriate', label: 'Conteúdo impróprio' },
  { value: 'spam', label: 'Spam ou golpe' },
  { value: 'broken', label: 'Site fora do ar' },
  { value: 'impersonation', label: 'Se passa por outro projeto' },
  { value: 'other', label: 'Outro motivo' },
]

const REPORT_ERROR_MESSAGES: Partial<Record<IApiError['code'], string>> = {
  rate_limited: 'Muitas denúncias seguidas. Tente de novo em alguns minutos.',
  turnstile_failed:
    'Não conseguimos confirmar que você não é um robô. Tente de novo.',
  not_found: 'Este site não está mais publicado.',
}

type ReportDialogProps = {
  websiteId: string
  websiteName: string
  isOpen: boolean
  onClose: () => void
}

export function ReportDialog({
  websiteId,
  websiteName,
  isOpen,
  onClose,
}: ReportDialogProps) {
  const [reason, setReason] = useState<IReportReason | null>(null)
  const [comment, setComment] = useState('')
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false)
  const report = useReportWebsite(websiteId)
  const { showMessage } = useMessage()

  const titleId = `report-${websiteId}`
  const commentId = `${titleId}-comment`
  const needsTurnstile = Boolean(TURNSTILE_SITE_KEY) && !turnstileToken

  function validationMessage() {
    if (!reason) return 'Escolha um motivo.'
    if (needsTurnstile) return 'Confirme que você não é um robô.'
    return null
  }

  const errorMessage = report.error
    ? (REPORT_ERROR_MESSAGES[report.error.code] ?? report.error.message)
    : hasTriedSubmit && validationMessage()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setHasTriedSubmit(true)
    if (!reason || needsTurnstile) return

    report.mutate(
      { report: { reason, comment: comment || undefined }, turnstileToken },
      {
        onSuccess: () => {
          showMessage('Obrigado. Vamos analisar a denúncia.')
          onClose()
        },
      }
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} variant='message'>
      <form
        className={styles.dialog}
        role='dialog'
        aria-modal='true'
        aria-labelledby={titleId}
        onSubmit={handleSubmit}
        noValidate={true}
      >
        <div className={styles.head}>
          <h2 id={titleId} className={styles.title}>
            Notificar problema com {websiteName}
          </h2>
          <button
            type='button'
            className={styles.close}
            onClick={onClose}
            aria-label='Fechar'
          >
            <LuX aria-hidden />
          </button>
        </div>

        <fieldset className={styles.reasons}>
          <legend className={styles.legend}>O que está errado?</legend>
          {REASONS.map((option) => (
            <ChoiceChip
              key={option.value}
              name='reason'
              checked={reason === option.value}
              onSelect={() => setReason(option.value)}
            >
              {option.label}
            </ChoiceChip>
          ))}
        </fieldset>

        <Field
          id={commentId}
          label='Detalhes (opcional)'
          hint={`${comment.length}/${COMMENT_MAX_LENGTH}`}
        >
          <Textarea
            id={commentId}
            rows={3}
            value={comment}
            maxLength={COMMENT_MAX_LENGTH}
            onChange={(event) => setComment(event.target.value)}
            aria-describedby={fieldMessageId(commentId)}
          />
        </Field>

        {TURNSTILE_SITE_KEY && (
          <TurnstileField
            siteKey={TURNSTILE_SITE_KEY}
            onTokenChange={setTurnstileToken}
          />
        )}

        <p className={styles.error} role='alert'>
          {errorMessage}
        </p>

        <div className={styles.actions}>
          <Button type='button' variant='secondary' onClick={onClose}>
            Cancelar
          </Button>
          <Button type='submit' disabled={report.isPending}>
            {report.isPending ? 'Enviando…' : 'Enviar denúncia'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

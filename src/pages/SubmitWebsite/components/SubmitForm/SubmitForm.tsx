import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { Button } from '@/components/Button/Button'
import { Input } from '@/components/Input/Input'
import { Textarea } from '@/components/Textarea/Textarea'
import { Typography } from '@/components/Typography/Typography'
import { TURNSTILE_SITE_KEY } from '@/config/env'
import type { IApiError } from '@/interfaces/IApiError'
import type { ISubmittedWebsite } from '@/interfaces/IWebsite'
import { CategoryPicker } from '@/pages/SubmitWebsite/components/CategoryPicker/CategoryPicker'
import { Field } from '@/components/Field/Field'
import { fieldMessageId } from '@/components/Field/fieldMessageId'
import { TurnstileField } from '@/components/TurnstileField/TurnstileField'
import { UrlField } from '@/pages/SubmitWebsite/components/UrlField/UrlField'
import { WebsitePreviewCard } from '@/pages/SubmitWebsite/components/WebsitePreviewCard/WebsitePreviewCard'
import { useSubmissionFields } from '@/pages/SubmitWebsite/hooks/useSubmissionFields'
import { useSubmitWebsite } from '@/pages/SubmitWebsite/hooks/useSubmitWebsite'
import { useWebsitePreview } from '@/pages/SubmitWebsite/hooks/useWebsitePreview'
import {
  DEFAULT_COLOR,
  DESCRIPTION_MAX_LENGTH,
  FIELD_IDS,
  NAME_MAX_LENGTH,
  toHexColor,
  toSubmission,
  validateSubmission,
  type SubmissionFormErrors,
} from '@/pages/SubmitWebsite/utils/submissionForm'
import styles from './SubmitForm.module.scss'

type SubmitFormProps = {
  onSubmitted: (website: ISubmittedWebsite) => void
}

const SUBMIT_ERROR_MESSAGES: Partial<Record<IApiError['code'], string>> = {
  rate_limited: 'Muitos envios seguidos. Tente de novo em alguns minutos.',
  turnstile_failed:
    'Não conseguimos confirmar que você não é um robô. Tente de novo.',
}

function focusFirstError(errors: SubmissionFormErrors) {
  const firstInvalid = (Object.keys(FIELD_IDS) as (keyof typeof FIELD_IDS)[])
    .filter((field) => errors[field])
    .map((field) => document.getElementById(FIELD_IDS[field]))[0]

  const focusTarget =
    firstInvalid instanceof HTMLFieldSetElement
      ? firstInvalid.querySelector('input')
      : firstInvalid

  focusTarget?.focus()
}

export function SubmitForm({ onSubmitted }: SubmitFormProps) {
  const [searchParams] = useSearchParams()
  const [url, setUrl] = useState(() => searchParams.get('url') ?? '')
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  const preview = useWebsitePreview(url)
  const { values, editField, setCategories } = useSubmissionFields(
    url,
    preview.data
  )
  const {
    mutate: submitWebsite,
    reset: resetSubmit,
    error: submitFailure,
    isPending: isSubmitting,
  } = useSubmitWebsite()

  const errors = hasTriedSubmit ? validateSubmission(values) : {}
  const isDuplicate =
    preview.error?.code === 'duplicate' || submitFailure?.code === 'duplicate'
  const needsTurnstile = Boolean(TURNSTILE_SITE_KEY) && !turnstileToken
  const submitError =
    submitFailure && submitFailure.code !== 'duplicate'
      ? (SUBMIT_ERROR_MESSAGES[submitFailure.code] ?? submitFailure.message)
      : null

  function handleUrlChange(value: string) {
    setUrl(value)
    resetSubmit()
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setHasTriedSubmit(true)

    const currentErrors = validateSubmission(values)
    if (Object.keys(currentErrors).length > 0) {
      focusFirstError(currentErrors)
      return
    }
    if (isDuplicate || needsTurnstile) return

    submitWebsite(
      {
        submission: toSubmission(values, preview.data?.faviconUrl),
        turnstileToken,
      },
      { onSuccess: onSubmitted }
    )
  }

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <Typography as='h1' variant='titleSm'>
          Adicionar um site
        </Typography>
        <Typography as='p' variant='bodyMd' color='muted'>
          Mais um nó na rede. Adicione um projeto brasileiro de tecnologia e
          ajude mais gente a chegar até ele.
        </Typography>
      </header>

      <div className={styles.preview}>
        <WebsitePreviewCard
          values={values}
          faviconUrl={preview.data?.faviconUrl}
          isLoading={preview.isFetching}
        />
      </div>

      <form
        className={styles.form}
        onSubmit={handleSubmit}
        noValidate={true}
        aria-label='Adicionar um site'
      >
        <UrlField
          value={url}
          onChange={handleUrlChange}
          validationError={errors.url}
          previewError={
            submitFailure?.code === 'duplicate' ? submitFailure : preview.error
          }
          isFetchingPreview={preview.isFetching}
          hasPreview={Boolean(preview.data)}
        />

        <Field
          id={FIELD_IDS.name}
          label='Nome'
          error={errors.name}
          hint={`${values.name.length}/${NAME_MAX_LENGTH}`}
        >
          <Input
            id={FIELD_IDS.name}
            name='name'
            value={values.name}
            maxLength={NAME_MAX_LENGTH}
            onChange={(event) => editField('name', event.target.value)}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={fieldMessageId(FIELD_IDS.name)}
          />
        </Field>

        <Field
          id={FIELD_IDS.description}
          label='Descrição'
          error={errors.description}
          hint={`${values.description.length}/${DESCRIPTION_MAX_LENGTH}`}
        >
          <Textarea
            id={FIELD_IDS.description}
            name='description'
            rows={3}
            value={values.description}
            maxLength={DESCRIPTION_MAX_LENGTH}
            onChange={(event) => editField('description', event.target.value)}
            aria-invalid={errors.description ? true : undefined}
            aria-describedby={fieldMessageId(FIELD_IDS.description)}
          />
        </Field>

        <Field
          id={FIELD_IDS.color}
          label='Cor do site'
          error={errors.color}
          hint='Usada nos destaques da página do site.'
        >
          <div className={styles.colorRow}>
            <input
              type='color'
              className={styles.swatch}
              value={toHexColor(values.color) ?? DEFAULT_COLOR}
              onChange={(event) => editField('color', event.target.value)}
              aria-label='Escolher cor'
            />
            <Input
              id={FIELD_IDS.color}
              name='color'
              className={styles.colorInput}
              value={values.color}
              onChange={(event) => editField('color', event.target.value)}
              aria-invalid={errors.color ? true : undefined}
              aria-describedby={fieldMessageId(FIELD_IDS.color)}
            />
          </div>
        </Field>

        <CategoryPicker
          value={values.categories}
          onChange={setCategories}
          error={errors.categories}
        />

        {TURNSTILE_SITE_KEY && (
          <TurnstileField
            siteKey={TURNSTILE_SITE_KEY}
            onTokenChange={setTurnstileToken}
          />
        )}

        <div className={styles.actions}>
          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting ? 'Enviando…' : 'Enviar site'}
          </Button>
        </div>
        <p className={styles.submitMessage} role='alert'>
          {submitError ??
            (hasTriedSubmit && needsTurnstile
              ? 'Confirme que você não é um robô.'
              : null)}
        </p>
      </form>
    </div>
  )
}

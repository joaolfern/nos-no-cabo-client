import type { ReactNode } from 'react'
import { Input } from '@/components/Input/Input'
import { Link } from '@/components/Link/Link'
import type { IApiError } from '@/interfaces/IApiError'
import { Field } from '@/pages/SubmitWebsite/components/Field/Field'
import { fieldMessageId } from '@/pages/SubmitWebsite/components/Field/fieldMessageId'
import { FIELD_IDS } from '@/pages/SubmitWebsite/utils/submissionForm'
import styles from './UrlField.module.scss'

type UrlFieldProps = {
  value: string
  onChange: (value: string) => void
  validationError?: string
  previewError: IApiError | null
  isFetchingPreview: boolean
  hasPreview: boolean
}

function previewErrorMessage(error: IApiError): ReactNode {
  if (error.code === 'duplicate' && error.existingId) {
    return (
      <>
        Esse site já está no Nós no Cabo.{' '}
        <Link className={styles.link} to={`/website/${error.existingId}`}>
          Ver página do site
        </Link>
      </>
    )
  }

  return error.message
}

function hintFor(isFetchingPreview: boolean, hasPreview: boolean) {
  if (isFetchingPreview) return 'Buscando informações do site…'
  if (hasPreview) return 'Encontramos o site. Confira os dados abaixo.'

  return 'Pode colar o endereço com ou sem https://'
}

export function UrlField({
  value,
  onChange,
  validationError,
  previewError,
  isFetchingPreview,
  hasPreview,
}: UrlFieldProps) {
  const isDuplicate = previewError?.code === 'duplicate'
  const error =
    validationError ??
    (isDuplicate ? previewErrorMessage(previewError) : undefined)
  const hint =
    previewError && !isDuplicate
      ? `${previewError.message} Preencha os dados abaixo.`
      : hintFor(isFetchingPreview, hasPreview)

  return (
    <Field
      id={FIELD_IDS.url}
      label='Endereço do site'
      hint={hint}
      error={error}
    >
      <Input
        id={FIELD_IDS.url}
        name='url'
        type='text'
        inputMode='url'
        autoComplete='url'
        autoFocus={true}
        placeholder='exemplo.com.br'
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={fieldMessageId(FIELD_IDS.url)}
      />
    </Field>
  )
}

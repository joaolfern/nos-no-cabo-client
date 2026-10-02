import { isCategorySlug } from '@/pages/Feed/constants/categories'
import type { IWebsiteSubmission } from '@/interfaces/IWebsite'
import { toAbsoluteUrl } from '@/utils/normalizeUrl/normalizeUrl'

export const NAME_MIN_LENGTH = 3
export const NAME_MAX_LENGTH = 80
export const DESCRIPTION_MAX_LENGTH = 280
export const MAX_CATEGORIES = 3
export const DEFAULT_COLOR = '#4a90e2'

export type SubmissionFormValues = {
  url: string
  name: string
  description: string
  color: string
  categories: string[]
}

export const FIELD_IDS: Record<keyof SubmissionFormValues, string> = {
  url: 'submit-url',
  name: 'submit-name',
  description: 'submit-description',
  color: 'submit-color',
  categories: 'submit-categories',
}

export type SubmissionFormErrors = Partial<
  Record<keyof SubmissionFormValues, string>
>

const HEX_COLOR = /^#([\da-f]{3}|[\da-f]{6})$/i

export function toHexColor(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? ''
  if (!HEX_COLOR.test(trimmed)) return null

  if (trimmed.length === 7) return trimmed.toLowerCase()

  const [r, g, b] = trimmed.slice(1)
  return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
}

export function validateSubmission(
  values: SubmissionFormValues
): SubmissionFormErrors {
  const errors: SubmissionFormErrors = {}
  const name = values.name.trim()

  if (!toAbsoluteUrl(values.url)) {
    errors.url = 'Informe um endereço válido, como exemplo.com.br.'
  }
  if (name.length < NAME_MIN_LENGTH) {
    errors.name = `O nome precisa ter pelo menos ${NAME_MIN_LENGTH} caracteres.`
  } else if (name.length > NAME_MAX_LENGTH) {
    errors.name = `O nome pode ter até ${NAME_MAX_LENGTH} caracteres.`
  }
  if (values.description.trim().length > DESCRIPTION_MAX_LENGTH) {
    errors.description = `A descrição pode ter até ${DESCRIPTION_MAX_LENGTH} caracteres.`
  }
  if (!toHexColor(values.color)) {
    errors.color = 'Use uma cor no formato #1a2b3c.'
  }
  if (values.categories.length === 0) {
    errors.categories = 'Escolha pelo menos uma categoria.'
  } else if (values.categories.length > MAX_CATEGORIES) {
    errors.categories = `Escolha até ${MAX_CATEGORIES} categorias.`
  }

  return errors
}

export function toSubmission(
  values: SubmissionFormValues,
  faviconUrl: string | null | undefined
): IWebsiteSubmission {
  return {
    url: toAbsoluteUrl(values.url) ?? values.url,
    name: values.name.trim(),
    description: values.description.trim(),
    color: toHexColor(values.color) ?? undefined,
    faviconUrl: faviconUrl ?? undefined,
    categories: values.categories.filter(isCategorySlug),
  }
}

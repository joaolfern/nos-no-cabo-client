export const TERMS_VERSION = '2026-10-01'
export const TERMS_VERSION_LABEL = '1º de outubro de 2026'
export const TERMS_CONTACT_EMAIL = 'joaolfern@proton.me'
export const TERMS_ACCEPTED_KEY = 'nnc-terms-accepted'

export const NO_ACCEPTED_TERMS = ''

export function isTermsVersion(value: unknown): value is string {
  return typeof value === 'string'
}

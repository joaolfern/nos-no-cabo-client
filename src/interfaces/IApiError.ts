export type ApiErrorCode =
  | 'duplicate'
  | 'invalid'
  | 'unreachable'
  | 'rate_limited'
  | 'turnstile_failed'
  | 'not_found'
  | 'internal'
  | 'unknown'

export interface IApiError {
  code: ApiErrorCode
  message: string
  status?: number
  existingId?: string
}

export interface IApiErrorResponse {
  error: {
    code: ApiErrorCode
    message: string
    existingId?: string
  }
}

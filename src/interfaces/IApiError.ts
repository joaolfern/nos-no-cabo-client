import type { ApiErrorCode as ContractApiErrorCode } from '@nosnocabo/contract'

// 'unknown' is client-only: a network failure or a response outside the contract.
export type ApiErrorCode = ContractApiErrorCode | 'unknown'

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

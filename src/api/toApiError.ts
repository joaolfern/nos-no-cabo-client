import { isAxiosError } from 'axios'
import type { ApiErrorCode, IApiError } from '@/interfaces/IApiError'

const CODE_BY_STATUS: Record<number, ApiErrorCode> = {
  404: 'not_found',
  409: 'duplicate',
  422: 'invalid',
  429: 'rate_limited',
}

function codeFromStatus(status: number | undefined): ApiErrorCode {
  if (status === undefined) return 'unknown'
  if (status >= 500) return 'internal'

  return CODE_BY_STATUS[status] ?? 'unknown'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readEnvelope(data: unknown, status: number | undefined) {
  if (!isRecord(data)) return null

  const { error, message } = data

  if (isRecord(error) && typeof error.message === 'string') {
    return {
      code: (error.code as ApiErrorCode | undefined) ?? codeFromStatus(status),
      message: error.message,
      existingId:
        typeof error.existingId === 'string' ? error.existingId : undefined,
    }
  }

  const legacyMessage = typeof error === 'string' ? error : message

  if (typeof legacyMessage === 'string') {
    return { code: codeFromStatus(status), message: legacyMessage }
  }

  return null
}

export function toApiError(error: unknown): IApiError {
  if (!isAxiosError(error)) {
    return {
      code: 'unknown',
      message: error instanceof Error ? error.message : String(error),
    }
  }

  const status = error.response?.status
  const envelope = readEnvelope(error.response?.data, status)

  if (envelope) return { ...envelope, status }

  return { code: codeFromStatus(status), message: error.message, status }
}

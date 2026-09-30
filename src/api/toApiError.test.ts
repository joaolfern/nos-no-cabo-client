import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios'
import { toApiError } from './toApiError'

function axiosErrorWith(status: number, data: unknown) {
  const response = {
    status,
    data,
    statusText: '',
    headers: {},
    config: { headers: new AxiosHeaders() },
  } as AxiosResponse

  return new AxiosError(
    `Request failed with status code ${status}`,
    undefined,
    undefined,
    undefined,
    response
  )
}

describe('toApiError', () => {
  it('reads the /v1 error envelope', () => {
    const error = axiosErrorWith(409, {
      error: { code: 'duplicate', message: 'Já existe', existingId: 'abc' },
    })

    expect(toApiError(error)).toEqual({
      code: 'duplicate',
      message: 'Já existe',
      existingId: 'abc',
      status: 409,
    })
  })

  it('reads the legacy {error: string} and {message} shapes', () => {
    expect(toApiError(axiosErrorWith(404, { error: 'Não achei' }))).toEqual({
      code: 'not_found',
      message: 'Não achei',
      status: 404,
    })
    expect(toApiError(axiosErrorWith(403, { message: 'Senha' }))).toEqual({
      code: 'unknown',
      message: 'Senha',
      status: 403,
    })
  })

  it('falls back to the status and axios message for unknown bodies', () => {
    expect(toApiError(axiosErrorWith(500, 'boom'))).toEqual({
      code: 'internal',
      message: 'Request failed with status code 500',
      status: 500,
    })
  })

  it('handles errors without a response', () => {
    expect(toApiError(new AxiosError('Network Error'))).toEqual({
      code: 'unknown',
      message: 'Network Error',
      status: undefined,
    })
    expect(toApiError(new Error('x'))).toEqual({
      code: 'unknown',
      message: 'x',
    })
  })
})

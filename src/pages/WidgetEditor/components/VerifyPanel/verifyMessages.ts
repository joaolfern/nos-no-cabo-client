import type { IApiError } from '@/interfaces/IApiError'
import type { IVerificationResult } from '@/interfaces/IWebsite'

export const VERIFY_PANEL_INTRO =
  'Cuida deste site? Com o selo instalado, ele ganha o ícone de verificado e sobe nas listas.'

export function verifyFailureMessage(
  result: IVerificationResult | undefined,
  error: IApiError | null
): string | null {
  if (error?.code === 'rate_limited') {
    return 'Aguarde um minuto antes de verificar de novo.'
  }
  if (error) return 'Não deu para verificar agora. Tente de novo.'
  if (!result || result.verified) return null
  if (result.reason === 'unreachable') {
    return 'Não conseguimos acessar o site. Tente de novo em alguns minutos.'
  }
  return 'Não encontramos o selo no site. Confira se o código foi colado e publicado.'
}

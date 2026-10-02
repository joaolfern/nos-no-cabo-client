const TURNSTILE_HEADER = 'cf-turnstile-response'

export function turnstileHeaders(token: string | null) {
  return token ? { [TURNSTILE_HEADER]: token } : undefined
}

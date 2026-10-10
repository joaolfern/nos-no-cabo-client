import { sharedUrl } from '@/pages/SubmitWebsite/utils/sharedUrl'

function share(query: string) {
  return sharedUrl(new URLSearchParams(query))
}

describe('sharedUrl', () => {
  it('prefers the url parameter', () => {
    expect(share('url=meu-projeto.dev&text=https://outro.dev')).toBe(
      'meu-projeto.dev'
    )
  })

  it('finds the address inside shared text', () => {
    expect(share('text=Olha esse projeto: https://exemplo.dev/sobre.')).toBe(
      'https://exemplo.dev/sobre'
    )
  })

  it('is empty when nothing was shared', () => {
    expect(share('text=sem endereço')).toBe('')
  })
})

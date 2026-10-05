import { visitUrl } from '@/utils/visitUrl/visitUrl'

describe('visitUrl', () => {
  it('goes through the short link when the site has one', () => {
    expect(visitUrl({ url: 'https://projeto.dev/', shortCode: 'abc123' })).toBe(
      'https://nosnocabo.pages.dev/r/abc123'
    )
  })

  it('links straight to the site without a short code', () => {
    expect(visitUrl({ url: 'https://projeto.dev/', shortCode: null })).toBe(
      'https://projeto.dev/'
    )
    expect(visitUrl({ url: 'https://projeto.dev/' })).toBe(
      'https://projeto.dev/'
    )
  })
})

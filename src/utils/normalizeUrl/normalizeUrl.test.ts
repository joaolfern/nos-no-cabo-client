import { normalizeUrl, toAbsoluteUrl } from './normalizeUrl'

describe('toAbsoluteUrl', () => {
  it('adds https when the scheme is missing', () => {
    expect(toAbsoluteUrl('exemplo.com')).toBe('https://exemplo.com/')
  })

  it('keeps an existing http or https scheme', () => {
    expect(toAbsoluteUrl('http://exemplo.com/a')).toBe('http://exemplo.com/a')
    expect(toAbsoluteUrl('  https://exemplo.com ')).toBe('https://exemplo.com/')
  })

  it('rejects empty, non-web and domainless input', () => {
    expect(toAbsoluteUrl('')).toBeNull()
    expect(toAbsoluteUrl('ftp://exemplo.com')).toBeNull()
    expect(toAbsoluteUrl('localhost')).toBeNull()
    expect(toAbsoluteUrl('não é url')).toBeNull()
  })
})

describe('normalizeUrl', () => {
  it('treats scheme, www, case and trailing slash variations as the same site', () => {
    const variations = [
      'exemplo.com',
      'https://exemplo.com/',
      'http://www.Exemplo.com',
      'HTTPS://WWW.EXEMPLO.COM//',
    ]

    expect(new Set(variations.map(normalizeUrl))).toEqual(
      new Set(['exemplo.com'])
    )
  })

  it('keeps the path, drops the query and the hash', () => {
    expect(normalizeUrl('https://exemplo.com/projeto/?id=2#topo')).toBe(
      'exemplo.com/projeto'
    )
    expect(normalizeUrl('fit.com/a')).not.toBe(normalizeUrl('fit.com/b'))
  })

  it('returns null for invalid input', () => {
    expect(normalizeUrl('não é url')).toBeNull()
  })
})

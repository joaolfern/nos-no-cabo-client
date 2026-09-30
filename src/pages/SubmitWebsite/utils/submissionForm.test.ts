import {
  toHexColor,
  toSubmission,
  validateSubmission,
  type SubmissionFormValues,
} from './submissionForm'

const valid: SubmissionFormValues = {
  url: 'exemplo.com',
  name: 'Exemplo',
  description: 'Um exemplo.',
  color: '#4a90e2',
  categories: ['educacao'],
}

describe('validateSubmission', () => {
  it('accepts a complete submission', () => {
    expect(validateSubmission(valid)).toEqual({})
  })

  it('flags each invalid field', () => {
    const errors = validateSubmission({
      url: 'não é url',
      name: ' ab ',
      description: 'x'.repeat(281),
      color: 'azul',
      categories: [],
    })

    expect(Object.keys(errors).sort()).toEqual([
      'categories',
      'color',
      'description',
      'name',
      'url',
    ])
  })

  it('limits categories to three', () => {
    expect(
      validateSubmission({ ...valid, categories: ['a', 'b', 'c', 'd'] })
        .categories
    ).toBe('Escolha até 3 categorias.')
  })
})

describe('toHexColor', () => {
  it('normalizes 3 and 6 digit hex colors', () => {
    expect(toHexColor('#ABC')).toBe('#aabbcc')
    expect(toHexColor(' #4A90E2 ')).toBe('#4a90e2')
  })

  it('rejects anything else', () => {
    expect(toHexColor('rgb(0, 0, 0)')).toBeNull()
    expect(toHexColor(null)).toBeNull()
  })
})

describe('toSubmission', () => {
  it('sends an absolute url, trimmed text and the scraped favicon', () => {
    expect(
      toSubmission(
        { ...valid, name: '  Exemplo  ', color: '#ABC' },
        'https://exemplo.com/favicon.ico'
      )
    ).toEqual({
      url: 'https://exemplo.com/',
      name: 'Exemplo',
      description: 'Um exemplo.',
      color: '#aabbcc',
      faviconUrl: 'https://exemplo.com/favicon.ico',
      categories: ['educacao'],
    })
  })
})

import type { IKeyword } from '@/interfaces/IWebsite'

const CATEGORY_NAMES = [
  'ia-e-iot',
  'educacao',
  'saude',
  'meio-ambiente',
  'cidades',
  'comunidades',
  'inclusao',
  'trabalho',
  'arte-e-cultura',
  'alimentacao',
  'outros',
] as const

type MockCategoryName = (typeof CATEGORY_NAMES)[number]

export const MOCK_KEYWORDS: IKeyword[] = CATEGORY_NAMES.map((name, index) => ({
  id: String(index + 1),
  name,
}))

export function mockKeywords(...names: MockCategoryName[]): IKeyword[] {
  return MOCK_KEYWORDS.filter((keyword) =>
    names.includes(keyword.name as MockCategoryName)
  )
}

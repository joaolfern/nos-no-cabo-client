import type { IconType } from 'react-icons'
import {
  LuAccessibility,
  LuBrainCircuit,
  LuBriefcase,
  LuBuilding2,
  LuGraduationCap,
  LuHeartPulse,
  LuLayers,
  LuLayoutGrid,
  LuLeaf,
  LuPalette,
  LuUsers,
  LuWheat,
} from 'react-icons/lu'

type CategoryMeta = {
  label: string
  Icon: IconType
  description: string
  bookSubject: string
}

export const ALL_CATEGORIES = {
  title: 'Todos os projetos',
  Icon: LuLayoutGrid,
  description: 'Todos os sites da aliança, de todas as categorias.',
}

const CATEGORIES: Record<string, CategoryMeta> = {
  'ia-e-iot': {
    label: 'IA e IoT',
    Icon: LuBrainCircuit,
    description:
      'IA aplicada ao bem comum, modelos e dados abertos em português, sensores, hardware aberto e automação.',
    bookSubject: 'artificial_intelligence',
  },
  educacao: {
    label: 'Educação',
    Icon: LuGraduationCap,
    description:
      'Escolas, gestão escolar, materiais abertos, alfabetização e ensino em português.',
    bookSubject: 'education',
  },
  saude: {
    label: 'Saúde',
    Icon: LuHeartPulse,
    description:
      'Saúde pública, ferramentas para o SUS, saúde mental, bem-estar e cuidado.',
    bookSubject: 'public_health',
  },
  'meio-ambiente': {
    label: 'Meio ambiente',
    Icon: LuLeaf,
    description:
      'Clima, água, florestas, energia limpa e comunitária, reciclagem e economia circular.',
    bookSubject: 'environment',
  },
  cidades: {
    label: 'Cidades',
    Icon: LuBuilding2,
    description:
      'Mobilidade, moradia, saneamento, espaços públicos, transparência e dados abertos.',
    bookSubject: 'cities_and_towns',
  },
  comunidades: {
    label: 'Comunidades',
    Icon: LuUsers,
    description:
      'Voluntariado, ajuda mútua, participação e comunidades de periferia, rurais, indígenas e quilombolas.',
    bookSubject: 'community_development',
  },
  inclusao: {
    label: 'Inclusão',
    Icon: LuAccessibility,
    description:
      'Acessibilidade, gênero, raça, LGBTQIA+, Libras e inclusão digital.',
    bookSubject: 'social_integration',
  },
  trabalho: {
    label: 'Trabalho',
    Icon: LuBriefcase,
    description:
      'Economia solidária, cooperativas, pequenos negócios locais e dados sobre o mercado de trabalho.',
    bookSubject: 'labor',
  },
  'arte-e-cultura': {
    label: 'Arte e Cultura',
    Icon: LuPalette,
    description:
      'Artes, acervos, patrimônio, coleções digitais e línguas indígenas e regionais.',
    bookSubject: 'art',
  },
  alimentacao: {
    label: 'Alimentação',
    Icon: LuWheat,
    description:
      'Agricultura familiar, segurança alimentar, combate ao desperdício e cadeias curtas.',
    bookSubject: 'food',
  },
  outros: {
    label: 'Outros',
    Icon: LuLayers,
    description: 'Projetos que não se encaixam nas outras categorias.',
    bookSubject: 'technology',
  },
}

export const CATEGORY_NAMES = Object.keys(CATEGORIES)

export function getCategoryMeta(name: string): CategoryMeta {
  return (
    CATEGORIES[name.toLowerCase()] ?? {
      label: name,
      Icon: LuLayers,
      description: `Projetos da categoria ${name}.`,
      bookSubject: name.replace(/ /g, '_'),
    }
  )
}

export function getCategoryLabel(name: string) {
  return getCategoryMeta(name).label
}

export function sortByCategoryOrder<T extends { name: string }>(
  options: T[]
): T[] {
  const orderOf = (name: string) => {
    const index = CATEGORY_NAMES.indexOf(name.toLowerCase())
    return index === -1 ? CATEGORY_NAMES.length : index
  }

  return [...options].sort((a, b) => orderOf(a.name) - orderOf(b.name))
}

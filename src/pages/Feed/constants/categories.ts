import type { IconType } from 'react-icons'
import {
  LuBookOpen,
  LuCode,
  LuGitBranch,
  LuGlobe,
  LuGraduationCap,
  LuLayers,
  LuLayoutGrid,
  LuTerminal,
  LuUsers,
} from 'react-icons/lu'

type CategoryMeta = {
  Icon: IconType
  description: string
}

export const ALL_CATEGORIES: CategoryMeta & { title: string } = {
  title: 'Todos os projetos',
  Icon: LuLayoutGrid,
  description: 'Todos os sites da aliança, de todas as categorias.',
}

const CATEGORIES: Record<string, CategoryMeta> = {
  repository: {
    Icon: LuGitBranch,
    description:
      'Repositórios e coleções de código aberto mantidos pela comunidade.',
  },
  code: {
    Icon: LuCode,
    description: 'Ferramentas, bibliotecas e projetos de software.',
  },
  web: { Icon: LuGlobe, description: 'Sites, plataformas e aplicações web.' },
  programming: {
    Icon: LuTerminal,
    description: 'Linguagens, tutoriais e conteúdo sobre programação.',
  },
  collaboration: {
    Icon: LuUsers,
    description: 'Iniciativas que conectam pessoas e projetos.',
  },
  documentation: {
    Icon: LuBookOpen,
    description: 'Guias, currículos e bases de conhecimento.',
  },
  education: {
    Icon: LuGraduationCap,
    description: 'Plataformas e materiais de ensino.',
  },
  other: {
    Icon: LuLayers,
    description: 'Projetos que não se encaixam nas outras categorias.',
  },
}

export function getCategoryMeta(name: string): CategoryMeta {
  return (
    CATEGORIES[name.toLowerCase()] ?? {
      Icon: LuLayers,
      description: `Projetos da categoria ${name}.`,
    }
  )
}

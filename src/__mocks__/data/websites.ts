import { MOCK_KEYWORDS } from '@/__mocks__/data/keywords'
import type { IWebsite } from '@/interfaces/IWebsite'

export const MOCK_WEBSITES: IWebsite[] = [
  {
    id: '1',
    name: 'Querido Diário',
    description:
      'Projeto de tecnologia cívica usando Python para libertar diários oficiais do governo.',
    url: 'https://queridodiario.ok.org.br',
    color: '#6c4b97',
    keywords: [MOCK_KEYWORDS[0], MOCK_KEYWORDS[1], MOCK_KEYWORDS[2]],
    createdAt: '2019-06-01T00:00:00.000Z',
    updatedAt: '2025-01-20T00:00:00.000Z',
    faviconUrl: 'https://queridodiario.ok.org.br/favicon.ico',
  },
  {
    id: '2',
    name: 'Conjuntura do mercado de trabalho brasileiro',
    description: 'Conjuntura do mercado de trabalho brasileiro.',
    url: 'https://arthurwelle.github.io/taxa_desocupacao.github.io/',
    color: '#007acc',
    keywords: [MOCK_KEYWORDS[0], MOCK_KEYWORDS[5], MOCK_KEYWORDS[1]],
    createdAt: '2015-02-15T00:00:00.000Z',
    updatedAt: '2024-11-10T00:00:00.000Z',
    faviconUrl: '',
  },

  {
    id: '4',
    name: 'i-Educar',
    description:
      'Maior software de gestão escolar open-source do Brasil (PHP).',
    url: 'https://ieducar.org',
    color: '#2d3748',
    keywords: [MOCK_KEYWORDS[7], MOCK_KEYWORDS[1], MOCK_KEYWORDS[2]],
    createdAt: '2010-01-01T00:00:00.000Z',
    updatedAt: '2025-03-01T00:00:00.000Z',
    faviconUrl: 'https://ieducar.org/img/logo_horizontal.svg',
  },
  {
    id: '5',
    name: 'Delegua',
    description:
      'Uma linguagem de programação inteiramente em português. Baseada em TypeScript.',
    url: 'https://github.com/DesignLiquido/delegua',
    color: '#3178c6',
    keywords: [MOCK_KEYWORDS[5], MOCK_KEYWORDS[0], MOCK_KEYWORDS[6]],
    createdAt: '2021-08-15T00:00:00.000Z',
    updatedAt: '2025-02-28T00:00:00.000Z',
    faviconUrl: 'https://github.githubassets.com/favicons/favicon.svg',
  },
  {
    id: '6',
    name: 'Tainacan',
    description:
      'Poderosa plataforma de repositório para WordPress para gerenciar coleções digitais.',
    url: 'https://tainacan.org',
    color: '#1a57a5',
    keywords: [MOCK_KEYWORDS[1], MOCK_KEYWORDS[7], MOCK_KEYWORDS[6]],
    createdAt: '2014-05-01T00:00:00.000Z',
    updatedAt: '2024-12-15T00:00:00.000Z',
    faviconUrl:
      'https://tainacan.org/wp-content/uploads/2018/05/cropped-cropped-logo-300x300-2-32x32.png',
  },
  {
    id: '7',
    name: 'TI no Canadá',
    description:
      'O objetivo deste site é auxiliar brasileiros e falantes de português com informações úteis sobre o Canadá',
    url: 'https://ti-no-canada.github.io',
    color: '#ff0000',
    keywords: [MOCK_KEYWORDS[5], MOCK_KEYWORDS[0], MOCK_KEYWORDS[1]],
    createdAt: '2020-04-20T00:00:00.000Z',
    updatedAt: '2023-10-05T00:00:00.000Z',
    faviconUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Flag_of_Canada_%28Pantone%29.svg/1200px-Flag_of_Canada_%28Pantone%29.svg.png',
  },
  {
    id: '8',
    name: 'Atados',
    description:
      'Plataforma de Voluntariado que conecta Pessoas e Oportunidades de Trabalho Voluntário.',
    url: 'https://www.atados.com.br',
    color: '#dc3545',
    keywords: [MOCK_KEYWORDS[2], MOCK_KEYWORDS[7], MOCK_KEYWORDS[1]],
    createdAt: '2024-05-01T00:00:00.000Z',
    updatedAt: '2024-06-01T00:00:00.000Z',
    faviconUrl: 'https://www.atados.com.br/static/logo/logo-light.svg',
  },
  {
    id: '9',
    name: 'Poku',
    description:
      'Um executor de testes multiplataforma que torna os testes simples. (TypeScript).',
    url: 'https://poku.io',
    color: '#f7df1e',
    keywords: [MOCK_KEYWORDS[0], MOCK_KEYWORDS[5], MOCK_KEYWORDS[7]],
    createdAt: '2023-11-01T00:00:00.000Z',
    updatedAt: '2025-02-15T00:00:00.000Z',
    faviconUrl: 'https://poku.io/favicon.ico',
  },
  {
    id: '10',
    name: 'Universidade Livre',
    description:
      'Um currículo completo de Ciência da Computação, aberto e gratuito em português.',
    url: 'https://github.com/Universidade-Livre',
    color: '#24292e',
    keywords: [MOCK_KEYWORDS[6], MOCK_KEYWORDS[1], MOCK_KEYWORDS[5]],
    createdAt: '2017-02-10T00:00:00.000Z',
    updatedAt: '2025-01-05T00:00:00.000Z',
    faviconUrl: 'https://github.githubassets.com/favicons/favicon.svg',
  },
  {
    id: '11',
    name: 'Estela',
    description:
      'O Estela é uma plataforma de e-commerce voltada para o mercado de jogos digitais, visando suprir as necessidades do público brasileiro com foco em segurança na transação e usabilidade.',
    url: 'https://estela-frontend.vercel.app/',
    color: '#4f46e5',
    keywords: [MOCK_KEYWORDS[7], MOCK_KEYWORDS[1], MOCK_KEYWORDS[0]],
    createdAt: '2023-12-01T00:00:00.000Z',
    updatedAt: '2025-12-19T00:00:00.000Z',
    faviconUrl: 'https://estela-frontend.vercel.app/favicon.ico',
  },
  {
    id: '12',
    name: 'Deepmed',
    description:
      'O deepmed é o primeiro ecossistema educacional brasileiro focado em transformar o aprendizado de medicina através de conteúdo programático específico, alinhado ao currículo das faculdades de medicina.',
    url: 'https://www.deepmed.net.br',
    color: '#0e7490',
    keywords: [MOCK_KEYWORDS[6], MOCK_KEYWORDS[1], MOCK_KEYWORDS[0]],
    createdAt: '2023-12-01T00:00:00.000Z',
    updatedAt: '2025-12-19T00:00:00.000Z',
    faviconUrl: 'https://deepmed.net.br/favicon.png',
  },
]

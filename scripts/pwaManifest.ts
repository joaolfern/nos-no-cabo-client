import type { ManifestOptions } from 'vite-plugin-pwa'

const DESCRIPTION =
  'Webring de projetos brasileiros de tecnologia: descubra sites de educação, saúde, cidades e mais, e adicione o seu.'

export const PWA_MANIFEST: Partial<ManifestOptions> = {
  id: '/',
  name: 'Nós no Cabo',
  short_name: 'Nós no Cabo',
  description: DESCRIPTION,
  lang: 'pt-BR',
  dir: 'ltr',
  start_url: '/websites',
  scope: '/',
  display: 'standalone',
  display_override: ['standalone', 'minimal-ui'],
  orientation: 'any',
  background_color: '#fbfafb',
  theme_color: '#fbfafb',
  categories: ['education', 'social'],
  icons: [
    { src: '/logos/pwa-64x64.png', sizes: '64x64', type: 'image/png' },
    { src: '/logos/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
    { src: '/logos/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
    {
      src: '/logos/maskable-icon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    },
  ],
  screenshots: [
    {
      src: '/screenshots/feed-wide.png',
      sizes: '1280x720',
      type: 'image/png',
      form_factor: 'wide',
      label: 'Projetos brasileiros de tecnologia, por categoria',
    },
    {
      src: '/screenshots/feed-narrow.png',
      sizes: '412x915',
      type: 'image/png',
      form_factor: 'narrow',
      label: 'Feed de projetos no celular',
    },
    {
      src: '/screenshots/website-narrow.png',
      sizes: '412x915',
      type: 'image/png',
      form_factor: 'narrow',
      label: 'Página de um projeto, com votos e o selo da aliança',
    },
  ],
  shortcuts: [
    {
      name: 'Ver projetos',
      url: '/websites',
      icons: [
        {
          src: '/logos/shortcut-home-96.png',
          sizes: '96x96',
          type: 'image/png',
        },
      ],
    },
    {
      name: 'Adicionar um site',
      url: '/websites/novo',
      icons: [
        {
          src: '/logos/shortcut-add-96.png',
          sizes: '96x96',
          type: 'image/png',
        },
      ],
    },
  ],
  share_target: {
    action: '/websites/novo',
    method: 'GET',
    params: { url: 'url', text: 'text', title: 'title' },
  },
  launch_handler: { client_mode: ['navigate-existing', 'auto'] },
  edge_side_panel: { preferred_width: 400 },
}

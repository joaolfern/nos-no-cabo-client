import { buildWidgetSnippet } from './buildWidgetSnippet'
import {
  WIDGET_ACCENTS,
  WIDGET_LOGOS,
  WIDGET_PRESETS,
  WIDGET_THEMES,
  presetDefinition,
  type WidgetAccent,
  type WidgetOptions,
} from './widgetPresets'

const URLS = {
  homeUrl: 'https://nosnocabo.pages.dev',
  ringBaseUrl: 'https://api.nosnocabo.dev/',
}

const BASE_OPTIONS: WidgetOptions = {
  preset: 'faixa',
  theme: 'auto',
  accent: 'rosa',
  logo: 'cor',
  nav: true,
  random: true,
}

function build(options: Partial<WidgetOptions> = {}, websiteId = '01JB7Q') {
  return buildWidgetSnippet({
    websiteId,
    options: { ...BASE_OPTIONS, ...options },
    ...URLS,
  })
}

const everyCombination: WidgetOptions[] = WIDGET_PRESETS.flatMap(({ id }) =>
  WIDGET_THEMES.flatMap(({ id: theme }) =>
    WIDGET_LOGOS.flatMap(({ id: logo }) =>
      (['rosa', 'verde'] as WidgetAccent[]).flatMap((accent) =>
        [true, false].flatMap((nav) =>
          [true, false].map((random) => ({
            preset: id,
            theme,
            accent,
            logo,
            nav,
            random,
          }))
        )
      )
    )
  )
)

describe('buildWidgetSnippet', () => {
  it.each(everyCombination)(
    'always carries the marker and a link to the webring (%o)',
    (options) => {
      const html = build(options)

      expect(html).toContain('href="https://nosnocabo.pages.dev/"')
      expect(html).toContain('data-nnc-widget="01JB7Q"')
    }
  )

  it.each(everyCombination)(
    'shows Aleatório and Anterior/Próximo only when enabled and supported (%o)',
    (options) => {
      const html = build(options)
      const preset = presetDefinition(options.preset)
      const isCustom = options.preset === 'personalizado'

      expect(html.includes('/ring/01JB7Q/random')).toBe(
        isCustom || (options.random && preset.supportsRandom)
      )
      expect(html.includes('/ring/01JB7Q/prev')).toBe(
        isCustom || (options.nav && preset.supportsNav)
      )
    }
  )

  it('ships scoped styles only for styled presets', () => {
    expect(build({ preset: 'faixa' })).toMatch(/<style>\.nnc-w\{all:initial/)
    expect(build({ preset: 'texto' })).not.toContain('<style>')
    expect(build({ preset: 'personalizado' })).not.toContain('<style>')
  })

  it('tells custom widget authors what to keep', () => {
    expect(build({ preset: 'personalizado' })).toContain(
      'Mantenha o atributo data-nnc-widget e o link para o Nós no Cabo'
    )
  })

  it('renders each logo variation', () => {
    expect(build({ logo: 'cor' })).toContain('class="nnc-mark"')
    expect(build({ logo: 'gradiente' })).toContain('url(#nnc-grad)')
    expect(build({ logo: 'original' })).toContain('class="nnc-badge"')
    expect(build({ preset: 'selo', logo: 'original' })).toContain(
      'nnc-selo-mark nnc-v-original'
    )
  })

  it('only includes the chosen accent and the theme attribute', () => {
    const html = build({ accent: 'azul', theme: 'escuro' })

    expect(html).toContain('data-tema="escuro"')
    expect(html).toContain(
      `.nnc-w[data-cor=azul]{--ac:${WIDGET_ACCENTS.azul.claro};--ad:${WIDGET_ACCENTS.azul.escuro}}`
    )
    expect(html).not.toContain('data-cor=rosa]')
  })

  it('ignores the colour unless the logo uses it', () => {
    for (const logo of ['gradiente', 'original'] as const) {
      const html = build({ logo, accent: 'azul' })

      expect(html).toBe(build({ logo, accent: 'verde' }))
      expect(html).not.toContain('data-cor')
    }
  })

  it('borders the Selo to match its logo', () => {
    expect(build({ preset: 'selo', logo: 'gradiente' })).toContain(
      'class="nnc-selo nnc-v-gradiente"'
    )
    expect(build({ preset: 'selo', logo: 'original' })).toContain(
      'class="nnc-selo nnc-v-original"'
    )
  })

  it('escapes the website id in attributes and urls', () => {
    const html = build({}, '"><script>x</script>')

    expect(html).not.toContain('<script>')
    expect(html).toContain('data-nnc-widget="&quot;&gt;&lt;script&gt;')
    expect(html).toContain('/ring/%22%3E%3Cscript%3Ex%3C%2Fscript%3E/random')
  })
})

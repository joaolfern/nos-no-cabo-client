import {
  WIDGET_ACCENTS,
  presetDefinition,
  type WidgetLogo,
  type WidgetOptions,
} from './widgetPresets'
import { GRADIENT_LOGO_SVG, MARK_SVG, SHUFFLE_SVG } from './widgetIcons'

type SnippetInput = {
  websiteId: string
  options: WidgetOptions
  homeUrl: string
  ringBaseUrl: string
}

type Links = { home: string; prev: string; next: string; random: string }

type StyledPreset = 'faixa' | 'selo' | 'cartao'

const DARK_VARS =
  '--nb:#131316;--nt:#ededf0;--nm:#9c9ca6;--nl:#2a2a30;--ui:#ef506c'
const BADGE_BACKGROUND = 'linear-gradient(135deg,#1a0d2e,#2d1a4a)'
const BADGE_BORDER = '#2d1a4a'
const BADGE_INK = '#cf95e9'
const GRADIENT_BORDER = 'linear-gradient(135deg,#ef506c,#b46cf2)'

// Reset at (0,1,0), rules at (0,2,0), link colours !important: host styles can't leak in.
const BASE_CSS = [
  '.nnc-w{all:initial;display:inline-block;box-sizing:border-box;max-width:100%;font:13px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--nt);--nb:#fff;--nt:#16161a;--nm:#5f5f69;--nl:#e2e2e7;--ui:#d7314f;--ai:#fff;--a:var(--ac)}',
  '.nnc-w :where(*:not(style,svg,svg *)){all:unset;box-sizing:border-box}',
  '.nnc-w a{cursor:pointer}',
  '.nnc-w .nnc-mark{width:17px;height:12px;flex:none}',
  '.nnc-w .nnc-logo{width:21px;height:15px;flex:none}',
  `.nnc-w .nnc-badge{display:flex;align-items:center;justify-content:center;flex:none;width:22px;height:22px;border-radius:6px;background:${BADGE_BACKGROUND};color:${BADGE_INK}!important}`,
  '.nnc-w .nnc-badge .nnc-mark{width:13px;height:9px}',
  '.nnc-w .nnc-ic{width:13px;height:13px;flex:none;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}',
  `.nnc-w[data-tema=escuro]{--a:var(--ad);${DARK_VARS}}`,
  `@media (prefers-color-scheme:dark){.nnc-w[data-tema=auto]{--a:var(--ad);${DARK_VARS}}}`,
].join('')

const LINK_CSS = [
  '.nnc-w .nnc-step{padding:4px 9px;border-radius:999px;color:var(--nm)!important;white-space:nowrap}',
  '.nnc-w .nnc-step:hover{color:var(--nt)!important}',
  '.nnc-w .nnc-rand{display:flex;align-items:center;gap:5px;padding:5px 12px;border-radius:999px;background:var(--ui);color:var(--ai)!important;font-weight:600;white-space:nowrap}',
].join('')

const PRESET_CSS: Record<StyledPreset, string> = {
  faixa: [
    '.nnc-w .nnc-strip{display:flex;flex-wrap:wrap;align-items:center;gap:6px 14px;padding:5px 5px 5px 14px;background:var(--nb);border:1px solid var(--nl);border-radius:20px}',
    '.nnc-w .nnc-strip.solo{padding:7px 14px}',
    '.nnc-w .nnc-home{display:flex;align-items:center;gap:7px;font-weight:600;color:var(--nt)!important;white-space:nowrap}',
    '.nnc-w .nnc-home .nnc-mark{color:var(--a)!important}',
    '.nnc-w .nnc-nav{display:flex;align-items:center;gap:2px}',
    LINK_CSS,
  ].join(''),
  selo: [
    '.nnc-w .nnc-selo{display:grid;grid-template-columns:20px minmax(0,1fr);width:88px;height:31px;overflow:hidden;background:var(--nb);border:1px solid var(--a,transparent);border-radius:5px;font-size:9px;line-height:1.15}',
    `.nnc-w .nnc-selo.nnc-v-gradiente{border-color:transparent;background:linear-gradient(var(--nb),var(--nb)) padding-box,${GRADIENT_BORDER} border-box}`,
    `.nnc-w .nnc-selo.nnc-v-original{border-color:${BADGE_BORDER}}`,
    '.nnc-w .nnc-selo-mark{display:flex;align-items:center;justify-content:center;background:var(--a);color:var(--ai)!important}',
    '.nnc-w .nnc-selo-mark.nnc-v-gradiente{background:var(--nb);border-right:1px solid var(--nl)}',
    `.nnc-w .nnc-selo-mark.nnc-v-original{background:${BADGE_BACKGROUND};color:${BADGE_INK}!important}`,
    '.nnc-w .nnc-selo-mark .nnc-mark{width:12px;height:8.5px}',
    '.nnc-w .nnc-selo-mark .nnc-logo{width:15px;height:11px}',
    '.nnc-w .nnc-selo-text{display:flex;flex-direction:column;justify-content:center;gap:2px;padding:0 3px;min-width:0}',
    '.nnc-w .nnc-selo-name{font-weight:700;letter-spacing:-0.02em;color:var(--nt)!important;white-space:nowrap}',
    '.nnc-w .nnc-selo-rand{display:flex;align-items:center;gap:3px;color:var(--ui)!important;font-weight:600;white-space:nowrap}',
    '.nnc-w .nnc-selo-sub{color:var(--nm)!important;white-space:nowrap}',
    '.nnc-w .nnc-selo-rand .nnc-ic{width:8px;height:8px;stroke-width:2.8}',
  ].join(''),
  cartao: [
    '.nnc-w .nnc-card{display:flex;flex-direction:column;gap:12px;width:300px;max-width:100%;padding:14px;background:var(--nb);border:1px solid var(--nl);border-radius:10px}',
    '.nnc-w .nnc-card-home{display:flex;align-items:center;gap:10px;color:var(--nt)!important}',
    '.nnc-w .nnc-tile{display:flex;align-items:center;justify-content:center;width:32px;height:32px;flex:none;border-radius:8px;background:var(--a);color:var(--ai)!important}',
    '.nnc-w .nnc-tile.nnc-v-gradiente{width:auto;height:auto;border-radius:0;background:none}',
    '.nnc-w .nnc-tile .nnc-logo{width:32px;height:23px}',
    `.nnc-w .nnc-tile.nnc-v-original{background:${BADGE_BACKGROUND};color:${BADGE_INK}!important}`,
    '.nnc-w .nnc-card-name{display:flex;flex-direction:column;gap:1px;min-width:0}',
    '.nnc-w .nnc-card-title{font-size:15px;font-weight:600}',
    '.nnc-w .nnc-card-desc{color:var(--nm)!important}',
    '.nnc-w .nnc-card-nav{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px;padding-top:12px;border-top:1px solid var(--nl)}',
    '.nnc-w .nnc-card-nav.solo{justify-content:center}',
    LINK_CSS,
    '.nnc-w .nnc-card .nnc-step{padding:4px 0}',
  ].join(''),
}

const NAME = 'Nós no Cabo'
const DESCRIPTION = 'Webring de projetos brasileiros de tecnologia'
const TEXT_DESCRIPTION = 'webring de projetos brasileiros de tecnologia'

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function widgetLinks(
  websiteId: string,
  homeUrl: string,
  ringBaseUrl: string
): Links {
  const ring = `${ringBaseUrl.replace(/\/+$/, '')}/ring/${encodeURIComponent(websiteId)}`

  return {
    home: homeUrl.replace(/\/*$/, '/'),
    prev: `${ring}/prev`,
    next: `${ring}/next`,
    random: `${ring}/random`,
  }
}

function buildLinks(input: SnippetInput): Links {
  const raw = widgetLinks(input.websiteId, input.homeUrl, input.ringBaseUrl)

  return {
    home: escapeHtml(raw.home),
    prev: escapeHtml(raw.prev),
    next: escapeHtml(raw.next),
    random: escapeHtml(raw.random),
  }
}

function logoMarkup(logo: WidgetLogo) {
  if (logo === 'gradiente') return GRADIENT_LOGO_SVG
  if (logo === 'original') return `<span class="nnc-badge">${MARK_SVG}</span>`
  return MARK_SVG
}

function tileLogo(logo: WidgetLogo) {
  return logo === 'gradiente' ? GRADIENT_LOGO_SVG : MARK_SVG
}

function textMarkup(links: Links, nav: boolean, random: boolean) {
  const parts = [
    nav && `<a href="${links.prev}">← Anterior</a>`,
    random && `<a href="${links.random}">Aleatório</a>`,
    nav && `<a href="${links.next}">Próximo →</a>`,
  ].filter(Boolean)
  const navigation = parts.length > 0 ? ` ${parts.join(' · ')}` : ''

  return `<p>Este site faz parte do <a href="${links.home}">${NAME}</a>, ${TEXT_DESCRIPTION}.${navigation}</p>`
}

function customMarkup(links: Links) {
  return [
    `<!-- Mantenha o atributo data-nnc-widget e o link para o ${NAME}: é assim que verificamos o seu site. -->`,
    `  <a href="${links.home}">${NAME}</a>`,
    `  <a href="${links.prev}">← Anterior</a>`,
    `  <a href="${links.random}">Aleatório</a>`,
    `  <a href="${links.next}">Próximo →</a>`,
  ].join('\n')
}

function styledMarkup(
  preset: StyledPreset,
  links: Links,
  { logo, nav, random }: { logo: WidgetLogo; nav: boolean; random: boolean }
) {
  const randomLink = random
    ? `<a class="nnc-rand" href="${links.random}">${SHUFFLE_SVG}Aleatório</a>`
    : ''
  const prev = nav
    ? `<a class="nnc-step" href="${links.prev}">← Anterior</a>`
    : ''
  const next = nav
    ? `<a class="nnc-step" href="${links.next}">Próximo →</a>`
    : ''
  const navLinks = `${prev}${randomLink}${next}`
  const variant = logo === 'cor' ? '' : ` nnc-v-${logo}`

  if (preset === 'selo') {
    const secondLine = random
      ? `<a class="nnc-selo-rand" href="${links.random}">${SHUFFLE_SVG}aleatório</a>`
      : `<a class="nnc-selo-sub" href="${links.home}">webring</a>`

    return `<div class="nnc-selo${variant}"><a class="nnc-selo-mark${variant}" href="${links.home}" title="${NAME}">${tileLogo(logo)}</a><span class="nnc-selo-text"><a class="nnc-selo-name" href="${links.home}">${NAME.toLowerCase()}</a>${secondLine}</span></div>`
  }

  if (preset === 'cartao') {
    const isSolo = [nav, nav, random].filter(Boolean).length === 1
    const navRow = navLinks
      ? `<div class="nnc-card-nav${isSolo ? ' solo' : ''}">${navLinks}</div>`
      : ''

    return `<div class="nnc-card"><a class="nnc-card-home" href="${links.home}"><span class="nnc-tile${variant}">${tileLogo(logo)}</span><span class="nnc-card-name"><span class="nnc-card-title">${NAME}</span><span class="nnc-card-desc">${DESCRIPTION}</span></span></a>${navRow}</div>`
  }

  const navGroup = navLinks ? `<span class="nnc-nav">${navLinks}</span>` : ''
  return `<div class="nnc-strip${navLinks ? '' : ' solo'}"><a class="nnc-home" href="${links.home}">${logoMarkup(logo)}${NAME}</a>${navGroup}</div>`
}

export function buildWidgetSnippet(input: SnippetInput): string {
  const { preset, theme, accent, logo } = input.options
  const definition = presetDefinition(preset)
  const nav = definition.supportsNav && input.options.nav
  const random = definition.supportsRandom && input.options.random
  const links = buildLinks(input)
  const marker = `data-nnc-widget="${escapeHtml(input.websiteId)}" data-modelo="${preset}"`

  if (preset === 'personalizado') {
    return `<aside ${marker}>\n  ${customMarkup(links)}\n</aside>`
  }

  if (preset === 'texto') {
    return `<aside class="nnc-wt" ${marker}>\n  ${textMarkup(links, nav, random)}\n</aside>`
  }

  const usesAccent = logo === 'cor'
  const colors = WIDGET_ACCENTS[accent]
  const accentCss = usesAccent
    ? `.nnc-w[data-cor=${accent}]{--ac:${colors.claro};--ad:${colors.escuro}}`
    : ''
  const accentAttribute = usesAccent ? ` data-cor="${accent}"` : ''
  const css = BASE_CSS + accentCss + PRESET_CSS[preset]
  const markup = styledMarkup(preset, links, { logo, nav, random })

  return `<aside class="nnc-w" ${marker} data-tema="${theme}"${accentAttribute}>\n  <style>${css}</style>\n  ${markup}\n</aside>`
}

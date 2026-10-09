import type { Plugin } from 'vite'

const FETCH_TIMEOUT_MS = 8000
const MAX_PAGE_BYTES = 1024 * 1024
const DESCRIPTION_KEYS = [
  'description',
  'og:description',
  'twitter:description',
]
const USER_AGENT = 'NosNoCaboBot/1.0 (+https://nosnocabo.com.br)'

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
}

function decodeEntities(text: string) {
  return text.replace(
    /&(#x[\da-f]+|#\d+|[a-z]+);/gi,
    (entity, code: string) => {
      if (code[0] !== '#') return NAMED_ENTITIES[code.toLowerCase()] ?? entity
      const isHex = code[1].toLowerCase() === 'x'
      return String.fromCodePoint(
        parseInt(code.slice(isHex ? 2 : 1), isHex ? 16 : 10)
      )
    }
  )
}

function attribute(tag: string, name: string) {
  const pattern = new RegExp(`\\s${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, 'i')
  return tag.match(pattern)?.[2]
}

// Same meta order as the catalog's scraper, so the mock preview matches production.
export function readMetaDescription(html: string) {
  const metas = new Map<string, string>()
  for (const [tag] of html.matchAll(/<meta\b[^>]*>/gi)) {
    const key = (
      attribute(tag, 'property') ?? attribute(tag, 'name')
    )?.toLowerCase()
    const content = attribute(tag, 'content')?.trim()
    if (key && content && !metas.has(key)) metas.set(key, content)
  }

  const found = DESCRIPTION_KEYS.map((key) => metas.get(key)).find(Boolean)
  return found ? decodeEntities(found).replace(/\s+/g, ' ') : null
}

async function fetchDescription(url: URL) {
  const response = await fetch(url, {
    headers: { 'user-agent': USER_AGENT, accept: 'text/html' },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })
  if (!response.ok) return null

  const html = (await response.text()).slice(0, MAX_PAGE_BYTES)
  return readMetaDescription(html)
}

function toPageUrl(value: string | null) {
  try {
    const url = new URL(value ?? '')
    return ['http:', 'https:'].includes(url.protocol) ? url : null
  } catch {
    return null
  }
}

// Dev only: the mocked API can't fetch other sites from the browser (CORS), so the dev server does it.
export function pageMetaPlugin(): Plugin {
  return {
    name: 'nnc-page-meta',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__mock/page-meta', async (request, response) => {
        const query = new URL(request.url ?? '', 'http://localhost')
        const url = toPageUrl(query.searchParams.get('url'))
        const description = url
          ? await fetchDescription(url).catch(() => null)
          : null

        response.setHeader('content-type', 'application/json')
        response.end(JSON.stringify({ description }))
      })
    },
  }
}

import { useEffect } from 'react'
import { NOS_NO_CABO_URL } from '@/config/env'

const SITE_NAME = 'Nós no Cabo'
export const DEFAULT_DESCRIPTION =
  'Webring de projetos brasileiros de tecnologia: descubra sites de educação, saúde, cidades e mais, e adicione o seu.'

type PageMeta = {
  title?: string
  description?: string
  path: string
  noIndex?: boolean
}

function upsertTag(
  tag: 'meta' | 'link',
  key: [string, string],
  attribute: string,
  value: string
) {
  const [keyName, keyValue] = key
  let element = document.head.querySelector(`${tag}[${keyName}="${keyValue}"]`)
  if (!element) {
    element = document.createElement(tag)
    element.setAttribute(keyName, keyValue)
    document.head.appendChild(element)
  }
  element.setAttribute(attribute, value)
}

// Updates the tags index.html already has, instead of adding React 19 <title>/<meta> elements
// next to them: link previews read the static ones, so both would end up in the head.
export function usePageMeta({
  title,
  description,
  path,
  noIndex = false,
}: PageMeta) {
  useEffect(() => {
    const fullTitle = title ? `${title} · ${SITE_NAME}` : SITE_NAME
    const text = description || DEFAULT_DESCRIPTION
    const url = `${NOS_NO_CABO_URL.replace(/\/+$/, '')}${path}`

    document.title = fullTitle
    upsertTag('meta', ['name', 'description'], 'content', text)
    upsertTag('meta', ['property', 'og:title'], 'content', fullTitle)
    upsertTag('meta', ['property', 'og:description'], 'content', text)
    upsertTag('meta', ['property', 'og:url'], 'content', url)
    upsertTag('link', ['rel', 'canonical'], 'href', url)

    if (!noIndex) return
    upsertTag('meta', ['name', 'robots'], 'content', 'noindex')
    return () => document.head.querySelector('meta[name="robots"]')?.remove()
  }, [title, description, path, noIndex])
}

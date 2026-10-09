import { setupWorker } from 'msw/browser'
import { handlers, previewHandler } from './handlers'

const PAGE_META_ENDPOINT = '/__mock/page-meta'

// Served by the dev server (scripts/vitePageMetaPlugin.ts); elsewhere it fails and the mock keeps its placeholder.
async function readPageDescription(url: string): Promise<string | null> {
  try {
    const response = await fetch(
      `${PAGE_META_ENDPOINT}?url=${encodeURIComponent(url)}`
    )
    if (!response.ok) return null
    const { description } = (await response.json()) as {
      description: string | null
    }
    return description
  } catch {
    return null
  }
}

export const worker = setupWorker(
  previewHandler(readPageDescription),
  ...handlers
)

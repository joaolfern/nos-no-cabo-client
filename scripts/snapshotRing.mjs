// Bakes the ring's sites into the bundle so the landing page never waits on a request.
// Run with the deploy's env (pnpm run snapshot:ring); keeps the committed snapshot if the API fails.
import { writeFileSync } from 'node:fs'

const OUTPUT = new URL(
  '../src/pages/LandingPage/data/ringSnapshot.json',
  import.meta.url
)
const SAMPLE_SIZE = 48
const TIMEOUT_MS = 10_000

const api = process.env.VITE_V1_API_URL?.replace(/\/+$/, '')
if (!api) {
  console.warn(
    'snapshot:ring: VITE_V1_API_URL is not set, keeping the current snapshot'
  )
  process.exit(0)
}

try {
  const response = await fetch(
    `${api}/websites?sort=melhores&limit=${SAMPLE_SIZE}`,
    {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    }
  )
  if (!response.ok) throw new Error(`HTTP ${response.status}`)

  const { items } = await response.json()
  const bubbles = items.map((site) => ({
    id: site.id,
    title: site.name,
    url: `/website/${site.id}`,
    imageSrc: site.faviconUrl ?? '/favicon.svg',
  }))
  if (bubbles.length === 0) throw new Error('the API returned no sites')

  const snapshot = { fetchedAt: Date.now(), items: bubbles }
  writeFileSync(OUTPUT, JSON.stringify(snapshot, null, 2) + '\n')
  console.log(`snapshot:ring: ${bubbles.length} sites from ${api}`)
} catch (error) {
  console.warn(`snapshot:ring: keeping the current snapshot (${error.message})`)
}

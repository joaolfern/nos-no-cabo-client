import { useSyncExternalStore } from 'react'
import type { IWebsite } from '@/interfaces/IWebsite'

// Kept in memory on purpose: a just-published site stays on top until the page reloads.
let published: IWebsite[] = []
const listeners = new Set<() => void>()

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  return () => listeners.delete(onChange)
}

function getSnapshot() {
  return published
}

function addPublished(websites: IWebsite[]) {
  const ids = new Set(websites.map((website) => website.id))
  published = [
    ...websites,
    ...published.filter((website) => !ids.has(website.id)),
  ]
  listeners.forEach((listener) => listener())
}

export function clearPublishedThisSession() {
  published = []
  listeners.forEach((listener) => listener())
}

export function usePublishedThisSession() {
  const websites = useSyncExternalStore(subscribe, getSnapshot)
  return { published: websites, addPublished }
}

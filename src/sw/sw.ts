/// <reference lib="webworker" />
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { ExpirationPlugin } from 'workbox-expiration'
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst } from 'workbox-strategies'
import { V1_API_URL } from '../config/env'

declare let self: ServiceWorkerGlobalScope

type PushMessage = {
  title: string
  body?: string
  tag?: string
  url?: string
}

const API_BASE = `${new URL(V1_API_URL).href}/`
const API_CACHE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60
const LIVE_ONLY_WEBSITE_PATHS = ['websites/status', 'websites/preview']
const CACHED_API_PATH =
  /^(categories|websites|websites\/[^/]+|websites\/[^/]+\/(page|stats))$/

function apiPath(url: URL) {
  return url.href.startsWith(API_BASE)
    ? url.pathname.slice(new URL(API_BASE).pathname.length)
    : null
}

function isCachedApiRequest(url: URL) {
  const path = apiPath(url)
  if (!path || LIVE_ONLY_WEBSITE_PATHS.includes(path)) return false
  return CACHED_API_PATH.test(path)
}

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// /ring/* and /r/* belong to the router Worker; serving the SPA shell there would break ring links.
registerRoute(
  new NavigationRoute(createHandlerBoundToURL('/index.html'), {
    denylist: [/^\/ring\//, /^\/r\//, /^\/__/],
  })
)

registerRoute(
  ({ url, request }) => request.method === 'GET' && isCachedApiRequest(url),
  new NetworkFirst({
    cacheName: 'nnc-api',
    networkTimeoutSeconds: 4,
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({
        maxEntries: 80,
        maxAgeSeconds: API_CACHE_MAX_AGE_SECONDS,
      }),
    ],
  })
)

registerRoute(
  ({ request }) => request.destination === 'font',
  new CacheFirst({
    cacheName: 'nnc-fonts',
    plugins: [new CacheableResponsePlugin({ statuses: [200] })],
  })
)

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

self.addEventListener('push', (event) => {
  const message = event.data?.json() as PushMessage | undefined
  if (!message) return

  event.waitUntil(
    self.registration.showNotification(message.title, {
      body: message.body,
      tag: message.tag,
      icon: '/logos/notification-icon-192.png',
      badge: '/logos/notification-badge-96.png',
      data: { url: message.url },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const url = new URL(event.notification.data?.url ?? '/', self.location.origin)
  const target =
    url.origin === self.location.origin ? url.href : self.location.origin
  event.waitUntil(self.clients.openWindow(target))
})

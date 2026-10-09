self.addEventListener('push', (event) => {
  const message = event.data?.json()
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

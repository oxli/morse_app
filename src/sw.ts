/// <reference lib="WebWorker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope;

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// Show notification when a push arrives
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data: { title?: string; body?: string; icon?: string; tag?: string };
  try {
    data = event.data.json();
  } catch {
    data = { body: event.data.text() };
  }

  event.waitUntil(
    self.registration.showNotification(data.title ?? 'Morse Code Trainer', {
      body: data.body ?? 'Time to practice!',
      icon: data.icon ?? '/favicon.svg',
      tag: data.tag ?? 'daily-reminder',
    })
  );
});

// Tap notification → focus or open the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if ('focus' in client) return client.focus();
        }
        return self.clients.openWindow('/');
      })
  );
});

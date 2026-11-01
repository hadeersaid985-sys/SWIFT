// Service Worker for SwiftMynd PWA & Push Notifications
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle incoming background push notifications
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { title: 'سويفت مايند', body: event.data.text() };
    }
  }

  const title = data.title || 'سويفت مايند - تنبيه جديد';
  const options = {
    body: data.body || 'لديك تحديث جديد في سويفت مايند',
    icon: data.icon || '/assets/aistudio/PROFILE2_3fe3b3a5.png',
    badge: '/assets/aistudio/PROFILE2_3fe3b3a5.png',
    data: data.data || {},
    dir: 'rtl',
    lang: 'ar',
    vibrate: [100, 50, 100],
    tag: data.tag || 'swiftmynd-push'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle user clicking on a system notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});

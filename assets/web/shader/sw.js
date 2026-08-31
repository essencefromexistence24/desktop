// Service worker intentionally disabled for the desktop dx preview.
// This file is kept as an inert no-op: it never intercepts fetches or caches
// anything. If an older worker is somehow active, activating this version
// unregisters itself and clears any stale caches.
self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (key) { return caches.delete(key); }));
    }).then(function () {
      return self.clients.claim();
    }).then(function () {
      return self.registration.unregister();
    })
  );
});

self.addEventListener('fetch', function () {
  // never intercept network requests; let the preview server serve live files
});

// 183‑Tage‑Checker Service Worker
// Cache‑Strategie: App‑Shell pre-cachen, Navigation network-first (Fallback: index.html), Assets cache-first.

const CACHE_VERSION = 'v1-2025-08-11';
const CACHE_NAME = `183days-${CACHE_VERSION}`;

const ASSETS = [
  './',
  './index.html',
  './app.webmanifest',
  './sw.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys
        .filter(k => k.startsWith('183days-') && k !== CACHE_NAME)
        .map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Navigations: network-first mit Fallback auf Cache
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Statische Assets: cache-first
  if (ASSETS.some(path => url.pathname.endsWith(path.replace('./','/')))) {
    event.respondWith(
      caches.match(req).then(cached => cached || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return res;
      }).catch(() => cached))
    );
    return;
  }

  // Sonst: network mit Fallback auf Cache
  event.respondWith(
    fetch(req).then(res => {
      if (req.method === 'GET') {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
      }
      return res;
    }).catch(() => caches.match(req))
  );
});

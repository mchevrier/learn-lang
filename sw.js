/* Service worker — installable PWA, offline support.
   App shell is precached on install; exercises.json and images are cached at
   runtime (stale-while-revalidate) so played exercises keep working offline. */

const VERSION = 'matilda-v10';
const SHELL = [
  './',
  'index.html',
  'logo.png',
  'css/styles.css',
  'js/app.js',
  'js/home.js',
  'js/ui.js',
  'js/drag.js',
  'js/games/link.js',
  'js/games/boxes.js',
  'js/games/tape.js',
  'exercises.json',
  'manifest.webmanifest',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
      .catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Only handle same-origin requests; let the browser deal with fonts/CDNs.
  if (url.origin !== self.location.origin) return;

  // SPA navigations -> serve the app shell.
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match('index.html').then((cached) => cached || fetch(req))
    );
    return;
  }

  // Stale-while-revalidate for everything else (css/js/json/images).
  event.respondWith(
    caches.open(VERSION).then(async (cache) => {
      const cached = await cache.match(req);
      const network = fetch(req)
        .then((res) => { if (res && res.ok) cache.put(req, res.clone()); return res; })
        .catch(() => cached);
      return cached || network;
    })
  );
});

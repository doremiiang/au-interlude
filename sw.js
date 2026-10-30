// Interlude Service Worker
// Versi cache dinaikkan supaya browser membuang app shell lama setelah deploy.
const CACHE_PREFIX = 'interlude-shell-';
const CACHE_NAME = `${CACHE_PREFIX}v2`;

const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/base.css',
  './css/phone.css',
  './css/lockscreen.css',
  './css/homescreen.css',
  './css/apps.css',
  './js/main.js',
  './js/core/icons.js',
  './js/core/clock.js',
  './js/core/lockscreen.js',
  './js/apps/app-view.js',
  './data/config.js',
  './data/apps.js',
  './assets/icons/app-icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL);
    // Activate this version immediately; the activate handler clears old app caches.
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
        .map((name) => caches.delete(name))
    );
    await self.clients.claim();
  })());
});

async function networkFirst(request, fallbackUrl = request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    // Prefer deployed files so CSS/JS updates appear immediately when online.
    const response = await fetch(request);
    if (response && response.ok && response.type !== 'opaque') {
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Offline fallback: use the matching cached request, then the app shell page.
    const cached = await cache.match(request) || await cache.match(fallbackUrl);
    if (cached) return cached;
    return Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const requestUrl = new URL(request.url);

  // Never intercept forms, POST requests, or third-party resources.
  if (request.method !== 'GET' || requestUrl.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, './index.html'));
    return;
  }

  event.respondWith(networkFirst(request));
});

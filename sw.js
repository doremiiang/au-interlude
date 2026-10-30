
const CACHE_PREFIX = 'interlude-shell-';
const CACHE_NAME = `${CACHE_PREFIX}v7`;

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
  './js/apps/messages.js',

  './data/config.js',
  './data/apps.js',
  './data/messages.js',

  './assets/icons/app-icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) =>
            key.startsWith(CACHE_PREFIX) &&
            key !== CACHE_NAME
          )
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestURL = new URL(event.request.url);

  if (requestURL.origin !== self.location.origin) return;

  // JavaScript selalu diambil dari jaringan.
  if (requestURL.pathname.endsWith('.js')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .catch(() =>
          caches.match(event.request)
            .then((cached) => cached || Response.error())
        )
    );
    return;
  }

  // File lainnya menggunakan Network First.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.ok) {
          const copy = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => cache.put(event.request, copy));
        }

        return response;
      })
      .catch(() =>
        caches.match(event.request)
          .then((cached) => cached || Response.error())
      )
  );
});

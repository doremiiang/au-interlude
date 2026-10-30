// Service worker minimal untuk cache app shell.
const CACHE_NAME = 'interlude-shell-v1';
const APP_SHELL = [
  './', './index.html', './manifest.webmanifest',
  './css/base.css', './css/phone.css', './css/lockscreen.css', './css/homescreen.css', './css/apps.css',
  './js/main.js', './js/core/icons.js', './js/core/clock.js', './js/core/lockscreen.js', './js/apps/app-view.js',
  './data/config.js', './data/apps.js', './assets/icons/app-icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});


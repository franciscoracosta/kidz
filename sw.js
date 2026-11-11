// Guarda a app no dispositivo para funcionar sem internet.
// Sempre que mudares ficheiros, sobe a versão para os iPads irem buscar a nova.
const VERSION = 'kidz-v2';
const FILES = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/games.js',
  './js/ui.js',
  './games/galo/galo.js',
  './games/galo/logic.js',
  './games/cinco/cinco.js',
  './games/cinco/logic.js',
  './games/pintar/pintar.js',
  './games/pintar/desenhos.js',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Rede primeiro (para apanhar atualizações), cache se não houver internet.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(VERSION).then((cache) => cache.put(event.request, copy));
        return res;
      })
      .catch(() => caches.match(event.request, { ignoreSearch: true })),
  );
});

// ============================================================
// sw.js — Service Worker PWA
// v3: HTML siempre desde red, assets estáticos en caché
// ============================================================

const CACHE_VERSION = 'v3';
const CACHE_NAME    = `spa-cache-${CACHE_VERSION}`;

// Solo cachear assets estáticos (NO archivos HTML)
const STATIC_ASSETS = [
  '/css/spa.css',
  '/js/main.js',
  '/js/animations.js',
  '/js/bookings.js',
  '/js/services.js',
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Instalar: precachear assets (no HTML)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activar: limpiar caches viejos y tomar control inmediato
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: estrategia según tipo de recurso
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API calls: siempre red, nunca caché
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request));
    return;
  }

  // Archivos HTML: siempre red (para que los cambios lleguen de inmediato)
  if (request.destination === 'document' || url.pathname.endsWith('.html') || url.pathname === '/') {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // Fuentes de Google: caché primero
  if (url.origin === 'https://fonts.googleapis.com' ||
      url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(
      caches.match(request).then(cached =>
        cached || fetch(request).then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(request, clone));
          return response;
        })
      )
    );
    return;
  }

  // CSS/JS/imágenes: caché primero, red como respaldo
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (!response || !response.ok || response.type === 'opaque') return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then(c => c.put(request, clone));
        return response;
      });
    })
  );
});

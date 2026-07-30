// ============================================================
// sw.js — Service Worker PWA
// v7: bust caché para modal de resumen de reserva
// ============================================================

const CACHE_VERSION = 'v7'
const CACHE_STATIC  = `spa-static-${CACHE_VERSION}`
const CACHE_API     = `spa-api-${CACHE_VERSION}`
const API_TTL_MS    = 5 * 60 * 1000  // 5 minutos para servicios/testimonios

const STATIC_ASSETS = [
  '/css/spa.css',
  '/js/animations.js',
  '/js/bookings.js',
  '/js/services.js',
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

// ——— Instalar ————————————————————————————————————————————
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  )
})

// ——— Activar: limpiar versiones viejas ——————————————————
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_STATIC && k !== CACHE_API)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  )
})

// ——— Fetch ————————————————————————————————————————————————
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // HTML: siempre red (cambios llegan de inmediato)
  if (request.destination === 'document' || url.pathname.endsWith('.html') || url.pathname === '/') {
    event.respondWith(fetch(request).catch(() => caches.match(request)))
    return
  }

  // main.js: siempre red (contiene lógica crítica)
  if (url.pathname === '/js/main.js') {
    event.respondWith(fetch(request).catch(() => caches.match(request)))
    return
  }

  // API pública (servicios, testimonios, config): caché corto (5 min)
  if (url.pathname.startsWith('/api/services') ||
      url.pathname.startsWith('/api/testimonials') ||
      url.pathname.startsWith('/api/config')) {
    event.respondWith(
      caches.open(CACHE_API).then(async cache => {
        const cached = await cache.match(request)
        if (cached) {
          const cachedAt = cached.headers.get('sw-cached-at')
          if (cachedAt && Date.now() - Number(cachedAt) < API_TTL_MS) {
            return cached
          }
        }
        const response = await fetch(request)
        if (response.ok) {
          const headers = new Headers(response.headers)
          headers.set('sw-cached-at', String(Date.now()))
          const body = await response.arrayBuffer()
          const cached = new Response(body, { status: response.status, statusText: response.statusText, headers })
          cache.put(request, cached.clone())
          return cached
        }
        return response
      }).catch(() => caches.match(request))
    )
    return
  }

  // Otras API calls: siempre red
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request))
    return
  }

  // Fuentes Google: caché permanente
  if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(
      caches.match(request).then(cached =>
        cached || fetch(request).then(res => {
          const clone = res.clone()
          caches.open(CACHE_STATIC).then(c => c.put(request, clone))
          return res
        })
      )
    )
    return
  }

  // CSS/JS estáticos: caché primero
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached
      return fetch(request).then(res => {
        if (!res || !res.ok || res.type === 'opaque') return res
        const clone = res.clone()
        caches.open(CACHE_STATIC).then(c => c.put(request, clone))
        return res
      })
    })
  )
})

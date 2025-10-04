// WashDrive Service Worker (Wave 5 PWA)
// Basic caching strategy: precache core, runtime cache for images, network-first for HTML.

const CACHE_VERSION = 'v2';
const CORE_CACHE = `washdrive-core-${CACHE_VERSION}`;
const RUNTIME_CACHE = `washdrive-runtime-${CACHE_VERSION}`;

// Core assets to precache (add others if needed)
const CORE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './js/landing.js',
  './site.webmanifest',
  './assets/logo.png',
  './privacy.html',
  './cookie-policy.html',
  './termini.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CORE_CACHE).then(cache => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => ![CORE_CACHE, RUNTIME_CACHE].includes(k)).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle same-origin
  if (url.origin !== self.location.origin) return;

  // Strategy: HTML -> network-first (so updates propagate)
  if (req.destination === 'document' || req.mode === 'navigate') {
    event.respondWith(networkFirst(req));
    return;
  }

  // Images: cache-first
  if (req.destination === 'image') {
    event.respondWith(cacheFirst(req));
    return;
  }

  // Everything else: try cache, fallback network
  event.respondWith(cacheFallingBackToNetwork(req));
});

async function networkFirst(req) {
  try {
    const fresh = await fetch(req);
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(req, fresh.clone());
    return fresh;
  } catch (e) {
    const cached = await caches.match(req);
    if (cached) return cached;
    // Offline fallback minimal inline response
    return new Response(`<!doctype html><html lang="it"><head><meta charset="utf-8"><title>Offline</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:system-ui;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:2rem;text-align:center}</style></head><body><main><h1>Sei offline</h1><p>Contenuto non disponibile senza connessione.<br>Torna online per aggiornare.<br><br><a href="./index.html" style="color:#22c55e">Riprova</a></p></main></body></html>`, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }
}

async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(req, res.clone());
    return res;
  } catch (e) {
    return cached || Response.error();
  }
}

async function cacheFallingBackToNetwork(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(req, res.clone());
    return res;
  } catch (e) {
    return cached || Response.error();
  }
}

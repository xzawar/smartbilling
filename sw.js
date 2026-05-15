/* ═══════════════════════════════════════════════════════════════
   SmartBilling PWA — Service Worker v4.0
   Handles: offline caching, background sync, install prompt
═══════════════════════════════════════════════════════════════ */

const CACHE_NAME = 'smartbilling-v4.0';
const SHELL_CACHE = 'smartbilling-shell-v4.0';

/* Assets to cache immediately on install (app shell) */
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Montserrat:wght@700;800;900&display=swap',
];

/* ── INSTALL ── */
self.addEventListener('install', event => {
  self.skipWaiting(); // activate immediately
  event.waitUntil(
    caches.open(SHELL_CACHE).then(cache => {
      // Cache what we can; ignore failures for CDN assets
      return Promise.allSettled(
        PRECACHE_ASSETS.map(url =>
          cache.add(url).catch(() => console.warn('[SW] Could not pre-cache:', url))
        )
      );
    })
  );
});

/* ── ACTIVATE ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== SHELL_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* ── FETCH — Network-first for Firebase, Cache-first for shell ── */
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip non-GET and chrome-extension requests
  if (event.request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // Firebase / API calls — always network-first, no caching
  if (
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('firebase') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('identitytoolkit')
  ) {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(JSON.stringify({ error: 'offline' }), {
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );
    return;
  }

  // Google Fonts — cache-first (stable, rarely changes)
  if (url.hostname.includes('fonts.')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          return response;
        }).catch(() => cached);
      })
    );
    return;
  }

  // App shell — cache-first with network fallback
  event.respondWith(
    caches.match(event.request).then(cached => {
      const networkFetch = fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(SHELL_CACHE).then(c => c.put(event.request, clone));
        }
        return response;
      }).catch(() => null);

      return cached || networkFetch || new Response(
        `<!DOCTYPE html><html><head><meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>SmartBilling — Offline</title>
        <style>
          body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;
          min-height:100vh;margin:0;background:linear-gradient(135deg,#1E3A8A,#5B21B6);color:#fff;text-align:center;padding:20px}
          h1{font-size:2rem;margin-bottom:12px}p{opacity:.7;margin-bottom:24px}
          button{background:#D4AF37;color:#1a1a1a;border:none;padding:12px 28px;border-radius:10px;
          font-size:15px;font-weight:700;cursor:pointer}
        </style></head>
        <body>
          <div>
            <div style="font-size:60px;margin-bottom:20px">📵</div>
            <h1>You're Offline</h1>
            <p>SmartBilling needs an internet connection to sync your data.<br>
            Your cached data is safe and will sync when you reconnect.</p>
            <button onclick="location.reload()">🔄 Try Again</button>
          </div>
        </body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    })
  );
});

/* ── BACKGROUND SYNC (fires when connection is restored) ── */
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(
      self.clients.matchAll().then(clients => {
        clients.forEach(client =>
          client.postMessage({ type: 'SYNC_RESTORED' })
        );
      })
    );
  }
});

/* ── PUSH NOTIFICATIONS (optional) ── */
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'SmartBilling', {
      body:  data.body  || '',
      icon:  './icons/icon-192.png',
      badge: './icons/icon-72.png',
      tag:   'smartbilling-push',
      data:  { url: data.url || './' }
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || './')
  );
});

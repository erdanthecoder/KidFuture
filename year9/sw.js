// Offline support: network first (so updates arrive straight away), cache as a fallback.
const CACHE = 'y9-v1';
const SHELL = ['./', 'index.html', 'styles.css', 'icon.svg', 'manifest.webmanifest', 'js/app.js', 'js/engine.js', 'js/fx.js', 'js/auth.js',
  'js/sims.js', 'js/content-maths.js', 'js/content-science.js', 'js/content-english.js'];

self.addEventListener('install', (e) => e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', (e) => e.waitUntil(caches.keys()
  .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/__/')) return;
  e.respondWith(fetch(e.request).then((res) => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
    return res;
  }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});

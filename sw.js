/* Service worker : coquille de l'appli hors-ligne, données toujours fraîches */
const V = "signature-v3";
const SHELL = ["./", "index.html", "css/style.css", "js/config.js", "js/i18n.js", "js/icons.js", "js/seed.js", "js/data.js", "js/app.js", "js/admin.js", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "img/logo-emblem.webp", "img/logo-wordmark.webp", "img/logo-tagline.webp"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(V).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET") return;
  if (u.origin !== location.origin) return;               // Supabase, polices, CDN : jamais interceptés
  if (r.mode === "navigate" || /\.(js|css|html|webmanifest)$/.test(u.pathname)) {
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); return res; }).catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || caches.match("index.html"))));
    return;
  }
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(m => m || fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); return res; })));
});

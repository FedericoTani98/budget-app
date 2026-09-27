// Service Worker minimo: non fa caching offline, serve solo a soddisfare
// il requisito di Chrome/Android per considerare l'app "installabile"
// e attivare l'evento beforeinstallprompt.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Un handler fetch, anche vuoto, è richiesto da Chrome per l'installabilità.
self.addEventListener("fetch", (event) => {
  // Nessun caching per ora: lasciamo che le richieste vadano sempre in rete.
});

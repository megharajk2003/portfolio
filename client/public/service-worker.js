self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Basic passthrough fetch; extend later if you want offline caching.
self.addEventListener("fetch", () => {});

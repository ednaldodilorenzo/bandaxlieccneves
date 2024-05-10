const CURRENT_CACHE_STATIC = "static-v3";

// service-worker.js
self.addEventListener("install", (event) => {
  console.log("Service worker installing...");
  // Pre-cache a route
  event.waitUntil(
    caches.open(CURRENT_CACHE_STATIC).then((cache) => {
      return cache.addAll([
        "/",
        "/index.html",
        "/js/app.js",
        "/js/request.js",
        "/js/vendor.js",
      ]);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CURRENT_CACHE_STATIC) {
            console.log("[Service worker] Removing old cache", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  console.log("Fetching:", event.request.url);
  // Cache-First Strategy
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

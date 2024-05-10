const CURRENT_CACHE_STATIC = "static-v3";
const CACHE_DYNAMIC_NAME = "dynamic-v1";

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
        "/css/app.css",
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
    caches.match(event.request).then(function (response) {
      if (response) {
        return response;
      } else {
        return fetch(event.request)
          .then(function (res) {
            return caches.open(CACHE_DYNAMIC_NAME).then(function (cache) {
              cache.put(event.request.url, res.clone());
              return res;
            });
          })
          .catch(function (err) {
            return caches.open(CURRENT_CACHE_STATIC).then(function (cache) {
              return cache.match("/offline.html");
            });
          });
      }
    })
  );
});

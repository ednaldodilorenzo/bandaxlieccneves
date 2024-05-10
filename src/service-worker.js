const CURRENT_CACHE_STATIC = "static-v4";
const CACHE_DYNAMIC_NAME = "dynamic-v2";
const STATIC_FILES = [
  "/",
  "/index.html",
  "/js/app.js",
  "/js/request.js",
  "/js/vendor.js",
  "/css/app.css",
  "/manifest.json",
];

// service-worker.js
self.addEventListener("install", (event) => {
  console.log("Service worker installing...");
  // Pre-cache a route
  event.waitUntil(
    caches.open(CURRENT_CACHE_STATIC).then((cache) => {
      return cache.addAll(STATIC_FILES);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (![CURRENT_CACHE_STATIC, CACHE_DYNAMIC_NAME].includes(key)) {
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
  if (
    event.request.url.includes("firestore.googleapis.com") ||
    event.request.url.includes("firebasestorage.googleapis.com") ||
    event.request.url.includes("cifras")
  ) {
    return event.respondWith(fetch(event.request));
  }
  // Cache-Only Strategy
  else if (
    STATIC_FILES.find((filePath) => event.request.url.endsWith(filePath))
  ) {
    console.log("Cache only ", event.request.url);
    event.respondWith(caches.match(event.request));
  } else {
    // Cache-First Strategy
    console.log("Cache first ", event.request.url);
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
  }
});

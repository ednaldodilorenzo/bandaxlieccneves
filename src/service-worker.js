const CURRENT_CACHE_STATIC = "static-v3";
const CURRENT_CACHE_AUDIO = "audio-v1";

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
          if (key !== CURRENT_CACHE_STATIC && key !== CURRENT_CACHE_AUDIO) {
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
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }
      // IMPORTANT: Clone the request. A request is a stream and
      // can only be consumed once. Since we are consuming this
      // once by cache and once by the browser for fetch, we need
      // to clone the response.
      var fetchRequest = event.request.clone();

      return fetch(fetchRequest).then((fetchResponse) => {
        if (
          !fetchResponse ||
          fetchResponse.status >= 300 ||
          fetchResponse.type !== "basic"
        ) {
          return fetchResponse;
        }

        // IMPORTANT: Clone the response. A response is a stream
        // and because we want the browser to consume the response
        // as well as the cache consuming the response, we need
        // to clone it so we have two streams.
        if (event.request.url.includes("firebasestorage.googleapis.com")) {
          var responseToCache = fetchResponse.clone();

          caches.open(CURRENT_CACHE_AUDIO).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return fetchResponse;
      });
    })
  );
});

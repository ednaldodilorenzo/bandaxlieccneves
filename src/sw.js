importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/7.1.0/workbox-sw.js"
);

self.addEventListener("install", () => {
  self.skipWaiting();
});

workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);
workbox.precaching.cleanupOutdatedCaches();

workbox.routing.registerRoute(
  new RegExp("/.*(?:firestore.googleapis|firebasestorage.googleapis).com.*$/"),
  new workbox.strategies.NetworkOnly()
);

async function isCached(url) {
  const cacheName = workbox.core.cacheNames.precache; // Get the current precache name
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(url);
  return !!cachedResponse;
}

workbox.routing.registerRoute(
  ({ url, event }) => {
    // Define URLs to exclude
    const urlPatternsToExclude = [
      /.*(?:firestore.googleapis|firebasestorage.googleapis)\.com.*$/,
    ];
    // Check if the request URL matches any excluded patterns
    const cleanUrl = url.origin + url.pathname;
    if (
      urlPatternsToExclude.some((pattern) => pattern.test(url.href)) ||
      isCached(cleanUrl)
    ) {
      return false;
    }
    
    return true;
  },
  new workbox.strategies.CacheFirst({
    cacheName: "dynamic-cache", // Name of the cache storage to use
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60, // Maximum number of entries in the cache.
        maxAgeSeconds: 30 * 24 * 60 * 60, // Items expire after 30 days
      }),
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200], // Cache responses with these HTTP status codes
      }),
    ],
  })
);

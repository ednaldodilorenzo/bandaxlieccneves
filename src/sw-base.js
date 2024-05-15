importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);

workbox.routing.registerRoute(
    new RegExp("/.*(?:firestore.googleapis|firebasestorage.googleapis)\.com.*$/"),
    new workbox.strategies.NetworkOnly()
);

workbox.routing.registerRoute(
    ({url, event}) => {
        // Define URLs to exclude
        const urlPatternsToExclude = [/.*(?:firestore.googleapis|firebasestorage.googleapis)\.com.*$/];
        // Check if the request URL matches any excluded patterns
        if (urlPatternsToExclude.some(pattern => pattern.test(url.href))) {
            return false;
        }
        // Optionally, check if the request is for precached assets
        // This part depends on your logic for identifying precached URLs
        // Let's assume you can check with a function `isPrecached` you would need to implement
        // if (isPrecached(url)) {
        //     return false;
        // }

        // If it doesn't match the excluded patterns and isn't precached, apply Cache First strategy
        return true;
    },
    new workbox.strategies.CacheFirst({
        cacheName: 'dynamic-cache', // Name of the cache storage to use
        plugins: [
            new workbox.expiration.ExpirationPlugin({
                maxEntries: 60, // Maximum number of entries in the cache.
                maxAgeSeconds: 30 * 24 * 60 * 60, // Items expire after 30 days
            }),
            new workbox.cacheableResponse.CacheableResponsePlugin({
                statuses: [0, 200], // Cache responses with these HTTP status codes
            })
        ]
    })
);

import { precacheAndRoute } from 'workbox-precaching';

// Precache files
precacheAndRoute(self.__WB_MANIFEST);

// service-worker.js
self.addEventListener('install', event => {
    console.log('Service worker installing...');
    // Pre-cache a route
    event.waitUntil(
        caches.open('static-v1').then(cache => {
            return cache.addAll([
                '/',
                '/index.html',
                '/js/bundle.js',
            ]);
        })
    );
});

self.addEventListener('fetch', event => {
    console.log('Fetching:', event.request.url);
    // Cache-First Strategy
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});

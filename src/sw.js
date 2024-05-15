importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

workbox.precaching.precacheAndRoute([{"revision":"edac58891e7d91433b49301d51b1f674","url":"index.html"},{"revision":"efd06c23adc3eb6d641d0f77911147d2","url":"css/app.css"},{"revision":"2a129fd28a94a6712ba0193b1ba9223e","url":"js/app.js"},{"revision":"c29bbf24eda4cb2d55e2e5056e22cbb6","url":"js/request.js"},{"revision":"4d85092b0037ae8c3ffaf3c9fc8910bc","url":"images/bx-down-arrow-alt.svg"},{"revision":"0c83c7283fc03e6bf81bb5a635530220","url":"images/check-regular-24.png"},{"revision":"6af79e3ebb5259d8ef6822cde6ed8ab4","url":"images/check-solid-24.svg"},{"revision":"5d518f6d648677aacc825b3088aa5019","url":"images/chevron-down-regular-24.png"},{"revision":"b8e6d232bf7409f5c1a150ee4c9ce158","url":"images/down-arrow-circle-regular-24.png"},{"revision":"11de4d0f97c26112c4859ca3df9f8596","url":"images/download-solid-24.png"},{"revision":"6c95dfd7376164f6af9eecd011a8b043","url":"images/icon-192x192.png"},{"revision":"015cb7705a8222ab43de01ecb50d874e","url":"images/icon-512x512.png"},{"revision":"e63c39589ad95271fb394092a644a68c","url":"images/pause-regular-24.png"},{"revision":"784a1d87b9bf29339834a02db7b01192","url":"images/pause-regular-36.png"},{"revision":"c32b180774f1b4403d133ab216873252","url":"images/play-regular-24.png"},{"revision":"b7a822308249943ec55ca0dd014d7d6b","url":"images/play-regular-36.png"},{"revision":"e9e492d44b9d12a4d23bc94a2a16270a","url":"images/skip-next-regular-24.png"},{"revision":"308d2e48d5656bc8cf2827ecd729690f","url":"images/skip-next-regular-36.png"},{"revision":"53df9b2d58b68dcd54793ae049078e6e","url":"images/skip-previous-regular-24.png"},{"revision":"45637160e621bcb12249a7038a9091b0","url":"images/skip-previous-regular-36.png"},{"revision":"6e7dad26852ae95c3129d747b1ef849c","url":"images/x-circle-regular-24.png"},{"revision":"63e35c05395eab42fe022073dff9da8a","url":"images/x-regular-24.png"},{"revision":"4c799e789ba9237d91d2fcc6a235603c","url":"manifest.json"}]);

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

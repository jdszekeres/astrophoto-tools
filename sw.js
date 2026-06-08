const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/pages/equivalent_exposures.html',
    '/pages/bortle.html',
    '/pages/bortle_reference.html',
    '/pages/sun_and_moon_rise.html',
    '/js/main.js',
    '/js/sun_and_moon_rise.js',
    '/js/bortle.js',
    '/js/bortle_reference.js',
    '/js/exposure.js',
    '/js/equivalent_exposures.js',
    '/js/night_sky.js',
    '/js/libraries/suncalc.js',
    '/js/components/navbar.js',
    '/js/components/page_item.js',
    '/css/style.css',
    '/css/index.css',
    '/css/ee.css',
    '/css/bortle.css',
    '/css/sun_and_moon_rise.css',
    '/assets/mondo_ridotto0p25.jpg',
    '/assets/bortle_reference.jpg',
];

const CACHE_NAME = 'astrophoto-tools-cache-v1';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Opened cache');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                return response;
            }
            return fetch(event.request);
        })
    );
});
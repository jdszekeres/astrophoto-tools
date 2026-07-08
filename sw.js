const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/pages/equivalent_exposures.html',
    '/pages/bortle.html',
    '/pages/bortle_reference.html',
    '/pages/sun_and_moon_rise.html',
    '/pages/400rule.html',
    '/pages/starchart.html',
    '/pages/recommended_settings.html',
    '/js/main.js',
    '/js/sun_and_moon_rise.js',
    '/js/bortle.js',
    '/js/bortle_reference.js',
    '/js/exposure.js',
    '/js/equivalent_exposures.js',
    '/js/night_sky.js',
    '/js/400rule.js',
    '/js/starchart.js',
    '/js/constellations.js',
    '/js/recommended_settings.js',
    '/js/libraries/suncalc.js',
    '/js/libraries/astronomy.browser.min.js',
    '/js/components/navbar.js',
    '/js/components/page_item.js',
    '/css/style.css',
    '/css/index.css',
    '/css/ee.css',
    '/css/bortle.css',
    '/css/400rule.css',
    '/css/sun_and_moon_rise.css',
    '/css/starchart.css',
    '/css/redlight.css',
    '/assets/mondo_ridotto0p25.webp',
    '/assets/bortle_reference.jpg',
    '/assets/star_catalog.json',
    '/assets/constellation-lines-hr.utf8.txt',
    '/assets/IAU-CSN.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/icons/icon-180x180.png'
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


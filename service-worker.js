/* service-worker.js - Service Worker for Offline Caching */

// Cache name and list of files to cache
const CACHE_NAME = 'ultimate-snake-tailwind-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/audio.js',
  '/touch.js',
  '/service-worker.js',
  '/README.md',
  // Assets
  '/assets/eat.mp3',
  '/assets/gameover.mp3',
  '/assets/background.mp3'
];

// Install event: Cache all essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .catch((err) => {
        console.error('Error caching files:', err);
      })
  );
});

// Fetch event: Respond with cached files when available
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
      .catch((err) => {
        console.error('Fetch error:', err);
      })
  );
});

// Activate event: Delete old caches if present
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
});

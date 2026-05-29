const CACHE_NAME = 'sahand-v1';
const MAP_TILES_CACHE = 'map-tiles-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Cache map tiles (OSM or similar)
  if (url.host.includes('tile.openstreetmap.org') || url.host.includes('basemaps.cartocdn.com')) {
    event.respondWith(
      caches.open(MAP_TILES_CACHE).then((cache) => {
        return cache.match(event.request).then((response) => {
          return response || fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // General caching for offline mode
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

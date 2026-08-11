const CACHE_VERSION = 'v1';
const STATIC_CACHE_NAME = `yaperz-static-${CACHE_VERSION}`;
const RUNTIME_CACHE_NAME = `yaperz-runtime-${CACHE_VERSION}`;

// Assets to precache immediately on service worker installation
const PRECACHE_ASSETS = [
  '/offline',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable.png',
  '/icons/apple-touch-icon.png',
  '/icons/favicon-32.png'
];

// Install Event - Precache the App Shell / Offline page
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Precaching app shell...');
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => {
      // Force active immediately
      return self.skipWaiting();
    })
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE_NAME && cacheName !== RUNTIME_CACHE_NAME) {
            console.log('[Service Worker] Deleting obsolete cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Claim clients immediately
      return self.clients.claim();
    })
  );
});

// Fetch Event - Caching strategies based on request type
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Bypass cache for non-GET requests, Chrome extension files, or Next.js HMR endpoints
  if (
    request.method !== 'GET' ||
    !url.protocol.startsWith('http') ||
    url.pathname.includes('/_next/webpack-hmr') ||
    url.pathname.startsWith('/api/')
  ) {
    return;
  }

  // 2. Navigation requests (Full Page Reloads / Initial navigations)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Check if response is valid, if so, store a clone in runtime cache
          if (response && response.status === 200 && response.type === 'basic') {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Network failed, try matching exact request in caches
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If page is not in cache, fallback to the pre-cached custom offline page
            return caches.match('/offline');
          });
        })
    );
    return;
  }

  // 3. Web Fonts (Cache-First)
  if (
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 4. Static Images (Cache-First, fallback to Network)
  if (
    request.destination === 'image' ||
    url.pathname.includes('/images/') ||
    url.pathname.includes('/products/')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          // Cache successful images (status 200, 304, or 0 for opaque cross-origin)
          if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 0)) {
            const responseClone = networkResponse.clone();
            caches.open(RUNTIME_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 5. CSS and JS Static Chunks (Stale-While-Revalidate)
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    url.pathname.includes('/_next/static/')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(RUNTIME_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        });

        // Return cached asset immediately if available, while updating cache in background
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }
});

// Service Worker for LN Forever PWA
const CACHE_NAME = 'ln-forever-v1';
const urlsToCache = [
  '/',
  '/games',
  '/games/role-play-roulette',
  '/games/would-you-rather',
  '/dashboard',
  '/profile',
  '/login',
  '/signup',
  '/images/ln_logo_favicon.png',
  '/manifest.json',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Cache install failed:', error);
      })
  );
  // Force activation of new service worker
  self.skipWaiting();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Don't cache Supabase API calls - always fetch from network
  if (url.hostname.includes('supabase.co') || 
      url.hostname.includes('supabase') ||
      request.url.includes('/auth/') ||
      request.url.includes('/rest/v1/')) {
    event.respondWith(fetch(request));
    return;
  }

  // Don't cache external images (Unsplash, etc.) - always fetch fresh
  if (url.hostname.includes('unsplash.com') || 
      url.hostname.includes('images.unsplash.com')) {
    event.respondWith(fetch(request));
    return;
  }

  // For other requests, try cache first, then network
  event.respondWith(
    caches.match(request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          return response;
        }
        // Otherwise fetch from network
        return fetch(request).then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          // Clone the response for caching
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        });
      })
      .catch(() => {
        // If both cache and network fail, return offline page if available
        if (request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all pages immediately
  return self.clients.claim();
});


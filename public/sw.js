const CACHE_NAME = "vehicle-tracker-v1"
const STATIC_CACHE = "vehicle-tracker-static-v1"
const DYNAMIC_CACHE = "vehicle-tracker-dynamic-v1"

// Assets to cache immediately
const STATIC_ASSETS = [
  "/",
  "/live-tracking",
  "/routes",
  "/notifications",
  "/offline",
  "/manifest.json",
  "/icon-192x192.jpg",
  "/icon-512x512.jpg",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
]

// API endpoints to cache
const API_CACHE_PATTERNS = [/\/api\/routes/, /\/api\/buses/, /\/api\/stops/]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker")
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("[SW] Caching static assets")
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log("[SW] Static assets cached")
        return self.skipWaiting()
      }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker")
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log("[SW] Deleting old cache:", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log("[SW] Service worker activated")
        return self.clients.claim()
      }),
  )
})

// Fetch event - serve from cache with network fallback
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Handle API requests with network-first strategy
  if (API_CACHE_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone response before caching
          const responseClone = response.clone()
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone)
          })
          return response
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse
            }
            // Return offline data if available
            return new Response(
              JSON.stringify({
                error: "Offline",
                message: "No cached data available",
              }),
              {
                headers: { "Content-Type": "application/json" },
              },
            )
          })
        }),
    )
    return
  }

  // Handle navigation requests
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => {
        // Serve offline page for navigation requests when offline
        return caches.match("/offline") || caches.match("/")
      }),
    )
    return
  }

  // Handle other requests with cache-first strategy
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response
        }

        // Clone response before caching
        const responseClone = response.clone()
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, responseClone)
        })

        return response
      })
    }),
  )
})

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync triggered:", event.tag)

  if (event.tag === "background-sync-notifications") {
    event.waitUntil(syncNotifications())
  }

  if (event.tag === "background-sync-favorites") {
    event.waitUntil(syncFavorites())
  }
})

// Push notification handler
self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received")

  const options = {
    body: event.data ? event.data.text() : "New vehicle update available",
    icon: "/icon-192x192.jpg",
    badge: "/icon-192x192.jpg",
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "View Details",
        icon: "/icon-192x192.jpg",
      },
      {
        action: "close",
        title: "Close",
        icon: "/icon-192x192.jpg",
      },
    ],
  }

  event.waitUntil(self.registration.showNotification("Real Time Vehicle Tracking", options))
})

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event.action)

  event.notification.close()

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/live-tracking"))
  }
})

// Helper functions for background sync
async function syncNotifications() {
  try {
    // Sync pending notifications with server
    const pendingNotifications = await getStoredNotifications()
    for (const notification of pendingNotifications) {
      await sendNotificationToServer(notification)
    }
    await clearStoredNotifications()
  } catch (error) {
    console.error("[SW] Failed to sync notifications:", error)
  }
}

async function syncFavorites() {
  try {
    // Sync favorite routes with server
    const pendingFavorites = await getStoredFavorites()
    for (const favorite of pendingFavorites) {
      await sendFavoriteToServer(favorite)
    }
    await clearStoredFavorites()
  } catch (error) {
    console.error("[SW] Failed to sync favorites:", error)
  }
}

async function getStoredNotifications() {
  // Implementation would retrieve from IndexedDB
  return []
}

async function sendNotificationToServer(notification) {
  // Implementation would send to server
  return fetch("/api/notifications", {
    method: "POST",
    body: JSON.stringify(notification),
  })
}

async function clearStoredNotifications() {
  // Implementation would clear IndexedDB
}

async function getStoredFavorites() {
  // Implementation would retrieve from IndexedDB
  return []
}

async function sendFavoriteToServer(favorite) {
  // Implementation would send to server
  return fetch("/api/favorites", {
    method: "POST",
    body: JSON.stringify(favorite),
  })
}

async function clearStoredFavorites() {
  // Implementation would clear IndexedDB
}

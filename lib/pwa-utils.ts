export const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js")
      console.log("Service Worker registered successfully:", registration)

      // Check for updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // New content is available, show update prompt
              if (confirm("New version available! Reload to update?")) {
                window.location.reload()
              }
            }
          })
        }
      })

      return registration
    } catch (error) {
      console.warn("Service Worker registration failed (this is normal in development):", error)
      return null
    }
  }
  return null
}

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications")
    return false
  }

  if (Notification.permission === "granted") {
    return true
  }

  if (Notification.permission !== "denied") {
    try {
      const permission = await Notification.requestPermission()
      return permission === "granted"
    } catch (error) {
      console.warn("Notification permission request failed:", error)
      return false
    }
  }

  return false
}

export const subscribeToPushNotifications = async (registration: ServiceWorkerRegistration | null) => {
  if (!registration) {
    console.warn("Cannot subscribe to push notifications: Service Worker not available")
    return null
  }

  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ""),
    })

    // Send subscription to server
    await fetch("/api/push-subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscription),
    })

    return subscription
  } catch (error) {
    console.error("Failed to subscribe to push notifications:", error)
    return null
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export const addToHomeScreen = () => {
  // This will be handled by the beforeinstallprompt event
  const event = (window as any).deferredPrompt
  if (event) {
    event.prompt()
  }
}

export const isStandalone = (): boolean => {
  return window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true
}

export const cacheRouteData = async (routeData: any) => {
  if ("caches" in window) {
    try {
      const cache = await caches.open("vehicle-tracker-route-data") // Updated cache name
      const response = new Response(JSON.stringify(routeData))
      await cache.put("/api/routes/cached", response)
    } catch (error) {
      console.warn("Failed to cache route data (caching not available):", error)
    }
  }
}

export const getCachedRouteData = async () => {
  if ("caches" in window) {
    try {
      const cache = await caches.open("vehicle-tracker-route-data") // Updated cache name
      const response = await cache.match("/api/routes/cached")
      if (response) {
        return await response.json()
      }
    } catch (error) {
      console.warn("Failed to get cached route data:", error)
    }
  }
  return null
}

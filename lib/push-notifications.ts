"use client"

export interface NotificationSubscription {
  id: string
  userId: string
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
  routeIds: string[]
  stopIds: string[]
  alertTypes: string[]
  isActive: boolean
  createdAt: Date
}

export interface PushNotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: any
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
}

class PushNotificationManager {
  private registration: ServiceWorkerRegistration | null = null
  private subscription: PushSubscription | null = null

  async initialize(): Promise<boolean> {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("Push notifications not supported")
      return false
    }

    try {
      this.registration = await navigator.serviceWorker.register("/sw.js")
      console.log("Service Worker registered")
      return true
    } catch (error) {
      console.error("Service Worker registration failed:", error)
      return false
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      return "denied"
    }

    if (Notification.permission === "granted") {
      return "granted"
    }

    if (Notification.permission === "denied") {
      return "denied"
    }

    const permission = await Notification.requestPermission()
    return permission
  }

  async subscribe(): Promise<PushSubscription | null> {
    if (!this.registration) {
      await this.initialize()
    }

    if (!this.registration) {
      return null
    }

    const permission = await this.requestPermission()
    if (permission !== "granted") {
      return null
    }

    try {
      // In a real app, you'd get this from your server
      const vapidPublicKey = "BEl62iUYgUivxIkv69yViEuiBIa40HI80NM9f8HnKJuOmLWjMpS_7VnYkYdYWjAlBEhOcgLXyMhqYAioEGgrtQM"

      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey),
      })

      return this.subscription
    } catch (error) {
      console.error("Push subscription failed:", error)
      return null
    }
  }

  async unsubscribe(): Promise<boolean> {
    if (!this.subscription) {
      return true
    }

    try {
      const result = await this.subscription.unsubscribe()
      this.subscription = null
      return result
    } catch (error) {
      console.error("Push unsubscription failed:", error)
      return false
    }
  }

  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.registration) {
      return null
    }

    return await this.registration.pushManager.getSubscription()
  }

  async showLocalNotification(payload: PushNotificationPayload): Promise<void> {
    if (!this.registration) {
      return
    }

    await this.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || "/icon-192x192.png",
      badge: payload.badge || "/icon-192x192.png",
      tag: payload.tag,
      data: payload.data,
      actions: payload.actions,
      requireInteraction: true,
      vibrate: [200, 100, 200],
    })
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  // Mock server API calls for demo
  async saveSubscriptionToServer(
    subscription: PushSubscription,
    preferences: {
      routeIds: string[]
      stopIds: string[]
      alertTypes: string[]
    },
  ): Promise<boolean> {
    try {
      // In a real app, send to your server
      console.log("Saving subscription to server:", { subscription, preferences })

      // Store in localStorage for demo
      localStorage.setItem(
        "pushSubscription",
        JSON.stringify({
          subscription: subscription.toJSON(),
          preferences,
          createdAt: new Date().toISOString(),
        }),
      )

      return true
    } catch (error) {
      console.error("Failed to save subscription:", error)
      return false
    }
  }

  async removeSubscriptionFromServer(): Promise<boolean> {
    try {
      // In a real app, notify your server
      console.log("Removing subscription from server")
      localStorage.removeItem("pushSubscription")
      return true
    } catch (error) {
      console.error("Failed to remove subscription:", error)
      return false
    }
  }
}

export const pushNotificationManager = new PushNotificationManager()

// Demo notification triggers
export const triggerBusArrivalNotification = (routeId: string, stopName: string, eta: number) => {
  pushNotificationManager.showLocalNotification({
    title: `Bus ${routeId} Approaching`,
    body: `Your bus will arrive at ${stopName} in ${eta} minutes`,
    tag: `bus-arrival-${routeId}`,
    data: { type: "bus_arrival", routeId, stopName, eta },
    actions: [
      { action: "view", title: "View Details" },
      { action: "dismiss", title: "Dismiss" },
    ],
  })
}

export const triggerServiceAlertNotification = (title: string, description: string, routeIds: string[]) => {
  pushNotificationManager.showLocalNotification({
    title: `Service Alert: ${title}`,
    body: description,
    tag: "service-alert",
    data: { type: "service_alert", routeIds },
    actions: [
      { action: "view", title: "View Details" },
      { action: "dismiss", title: "Dismiss" },
    ],
  })
}

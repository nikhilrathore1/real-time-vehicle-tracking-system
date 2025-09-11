"use client"

import { useEffect } from "react"
import { registerServiceWorker, requestNotificationPermission } from "@/lib/pwa-utils"

export function PWAInitializer() {
  useEffect(() => {
    const initializePWA = async () => {
      try {
        // Register service worker (will handle errors gracefully)
        const registration = await registerServiceWorker()

        if (registration) {
          console.log("PWA features fully enabled")
        } else {
          console.log("PWA running in fallback mode (service worker not available)")
        }

        // Request notification permission after user interaction
        const handleUserInteraction = async () => {
          try {
            await requestNotificationPermission()
          } catch (error) {
            console.warn("Notification setup failed:", error)
          }
          document.removeEventListener("click", handleUserInteraction)
        }

        document.addEventListener("click", handleUserInteraction)

        return () => {
          document.removeEventListener("click", handleUserInteraction)
        }
      } catch (error) {
        console.warn("PWA initialization failed, running in basic mode:", error)
      }
    }

    initializePWA()
  }, [])

  return null
}

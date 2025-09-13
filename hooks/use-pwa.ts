"use client"

import { useState, useEffect } from "react"

interface PWAState {
  isInstalled: boolean
  isOnline: boolean
  canInstall: boolean
  isUpdateAvailable: boolean
  serviceWorkerSupported: boolean
}

export function usePWA() {
  const [pwaState, setPWAState] = useState<PWAState>({
    isInstalled: false,
    isOnline: true,
    canInstall: false,
    isUpdateAvailable: false,
    serviceWorkerSupported: false,
  })

  useEffect(() => {
    // Check if app is installed
    const checkInstalled = () => {
      const isInstalled =
        window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true
      setPWAState((prev) => ({ ...prev, isInstalled }))
    }

    // Check online status
    const updateOnlineStatus = () => {
      setPWAState((prev) => ({ ...prev, isOnline: navigator.onLine }))
    }

    // Check service worker support
    const checkServiceWorkerSupport = () => {
      const supported = "serviceWorker" in navigator
      setPWAState((prev) => ({ ...prev, serviceWorkerSupported: supported }))
    }

    // Check for updates
    const checkForUpdates = async () => {
      if ("serviceWorker" in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration()
          if (registration) {
            registration.addEventListener("updatefound", () => {
              const newWorker = registration.installing
              if (newWorker) {
                newWorker.addEventListener("statechange", () => {
                  if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                    setPWAState((prev) => ({ ...prev, isUpdateAvailable: true }))
                  }
                })
              }
            })
          }
        } catch (error) {
          console.warn("Service worker check failed:", error)
        }
      }
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setPWAState((prev) => ({ ...prev, canInstall: true }))
    }

    // Initial checks
    checkInstalled()
    updateOnlineStatus()
    checkServiceWorkerSupport()
    checkForUpdates()

    // Event listeners
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
    }
  }, [])

  const installApp = async () => {
    const deferredPrompt = (window as any).deferredPrompt
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        if (outcome === "accepted") {
          setPWAState((prev) => ({ ...prev, canInstall: false }))
        }
      } catch (error) {
        console.warn("App installation failed:", error)
      }
    }
  }

  const updateApp = async () => {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" })
          window.location.reload()
        }
      } catch (error) {
        console.warn("App update failed:", error)
      }
    }
  }

  return {
    ...pwaState,
    installApp,
    updateApp,
  }
}

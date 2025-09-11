"use client"

import { useState, useEffect } from "react"
import { WifiOff, Wifi } from "lucide-react"

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine
      setIsOnline(online)

      if (!online) {
        setShowIndicator(true)
      } else {
        // Show "back online" briefly then hide
        setShowIndicator(true)
        setTimeout(() => setShowIndicator(false), 3000)
      }
    }

    // Initial check
    updateOnlineStatus()

    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)

    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
    }
  }, [])

  if (!showIndicator) return null

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
      <div
        className={`px-4 py-2 rounded-full shadow-xl border-2 backdrop-blur-none ${
          isOnline ? "bg-green-600 text-white border-green-700" : "bg-red-600 text-white border-red-700"
        }`}
        style={{
          backgroundColor: isOnline ? "#059669" : "#dc2626",
          color: "#ffffff",
          opacity: 1,
        }}
      >
        <div className="flex items-center gap-2 text-sm font-semibold">
          {isOnline ? (
            <>
              <Wifi className="h-4 w-4" />
              <span style={{ color: "#ffffff" }}>Back Online</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4" />
              <span style={{ color: "#ffffff" }}>Offline Mode</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

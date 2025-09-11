"use client"

import { useEffect, useRef, useState } from "react"
import { getBusTrackingWebSocket } from "@/lib/websocket"

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef(getBusTrackingWebSocket())

  useEffect(() => {
    const ws = wsRef.current

    const connectWebSocket = async () => {
      try {
        await ws.connect()
        setIsConnected(true)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "WebSocket connection failed")
        setIsConnected(false)
      }
    }

    // Try to connect, but don't fail if WebSocket server is not available
    connectWebSocket().catch(() => {
      // Silently handle connection failure for demo purposes
      console.log("WebSocket server not available, using mock data")
    })

    return () => {
      ws.disconnect()
    }
  }, [])

  const subscribe = (event: string, callback: (data: any) => void) => {
    wsRef.current.on(event, callback)
    return () => wsRef.current.off(event, callback)
  }

  const send = (message: any) => {
    wsRef.current.send(message)
  }

  return {
    isConnected,
    error,
    subscribe,
    send,
    subscribeToRoute: (routeId: string) => wsRef.current.subscribeToRoute(routeId),
    subscribeToBus: (busId: string) => wsRef.current.subscribeToBus(busId),
    subscribeToStop: (stopId: string) => wsRef.current.subscribeToStop(stopId),
  }
}

"use client"

export class BusTrackingWebSocket {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private listeners: Map<string, Set<(data: any) => void>> = new Map()

  constructor(private url = "ws://localhost:8000/ws/buses") {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url)

        this.ws.onopen = () => {
          console.log("WebSocket connected")
          this.reconnectAttempts = 0
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            this.handleMessage(data)
          } catch (error) {
            console.error("Failed to parse WebSocket message:", error)
          }
        }

        this.ws.onclose = () => {
          console.log("WebSocket disconnected")
          this.handleReconnect()
        }

        this.ws.onerror = (error) => {
          console.error("WebSocket error:", error)
          reject(error)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  private handleMessage(data: any) {
    const { type, payload } = data

    switch (type) {
      case "bus_location_update":
        this.emit("busLocationUpdate", payload)
        break
      case "bus_status_change":
        this.emit("busStatusChange", payload)
        break
      case "route_disruption":
        this.emit("routeDisruption", payload)
        break
      case "eta_update":
        this.emit("etaUpdate", payload)
        break
      default:
        console.log("Unknown message type:", type)
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`)

      setTimeout(() => {
        this.connect().catch(console.error)
      }, delay)
    } else {
      console.error("Max reconnection attempts reached")
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
  }

  off(event: string, callback: (data: any) => void) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.delete(callback)
    }
  }

  private emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach((callback) => callback(data))
    }
  }

  send(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn("WebSocket is not connected")
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.listeners.clear()
  }

  // Subscribe to specific route updates
  subscribeToRoute(routeId: string) {
    this.send({
      type: "subscribe_route",
      payload: { routeId },
    })
  }

  // Subscribe to specific bus updates
  subscribeToBus(busId: string) {
    this.send({
      type: "subscribe_bus",
      payload: { busId },
    })
  }

  // Subscribe to stop updates
  subscribeToStop(stopId: string) {
    this.send({
      type: "subscribe_stop",
      payload: { stopId },
    })
  }
}

// Singleton instance
let wsInstance: BusTrackingWebSocket | null = null

export function getBusTrackingWebSocket(): BusTrackingWebSocket {
  if (!wsInstance) {
    wsInstance = new BusTrackingWebSocket()
  }
  return wsInstance
}

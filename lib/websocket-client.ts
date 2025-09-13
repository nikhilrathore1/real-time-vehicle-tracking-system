// WebSocket client utilities for frontend
export class VehicleTrackingWebSocket {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private subscriptions = new Set<string>()
  private messageHandlers = new Map<string, Function[]>()
  private authToken: string | null = null

  constructor(private url = "ws://localhost:8080") {
    this.connect()
  }

  // Connect to WebSocket server
  private connect() {
    try {
      this.ws = new WebSocket(this.url)

      this.ws.onopen = () => {
        console.log("[WebSocket] Connected")
        this.reconnectAttempts = 0

        // Authenticate if token available
        if (this.authToken) {
          this.authenticate(this.authToken)
        }

        // Resubscribe to channels
        this.subscriptions.forEach((channel) => {
          this.send({ type: "subscribe", channel })
        })

        this.emit("connected")
      }

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error("[WebSocket] Message parsing error:", error)
        }
      }

      this.ws.onclose = () => {
        console.log("[WebSocket] Disconnected")
        this.emit("disconnected")
        this.attemptReconnect()
      }

      this.ws.onerror = (error) => {
        console.error("[WebSocket] Error:", error)
        this.emit("error", error)
      }
    } catch (error) {
      console.error("[WebSocket] Connection error:", error)
      this.attemptReconnect()
    }
  }

  // Attempt to reconnect
  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

      console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)

      setTimeout(() => {
        this.connect()
      }, delay)
    } else {
      console.error("[WebSocket] Max reconnection attempts reached")
      this.emit("max_reconnect_attempts")
    }
  }

  // Send message to server
  private send(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn("[WebSocket] Cannot send message - not connected")
    }
  }

  // Handle incoming messages
  private handleMessage(message: any) {
    const { type } = message

    // Emit to specific type handlers
    this.emit(type, message)

    // Emit to general message handlers
    this.emit("message", message)
  }

  // Authenticate with server
  authenticate(token: string) {
    this.authToken = token
    this.send({ type: "auth", token })
  }

  // Subscribe to a channel
  subscribe(channel: string) {
    this.subscriptions.add(channel)
    this.send({ type: "subscribe", channel })
  }

  // Unsubscribe from a channel
  unsubscribe(channel: string) {
    this.subscriptions.delete(channel)
    this.send({ type: "unsubscribe", channel })
  }

  // Subscribe to vehicle location updates
  subscribeToVehicle(vehicleId: number) {
    this.subscribe(`vehicle:${vehicleId}`)
  }

  // Subscribe to route updates
  subscribeToRoute(routeId: number) {
    this.subscribe(`route:${routeId}`)
  }

  // Subscribe to stop ETA updates
  subscribeToStop(stopId: number) {
    this.subscribe(`stop:${stopId}`)
  }

  // Subscribe to city-wide alerts
  subscribeToCity(cityId: number) {
    this.subscribe(`city:${cityId}`)
  }

  // Subscribe to general tracking updates
  subscribeToTracking() {
    this.subscribe("tracking")
  }

  // Subscribe to service alerts
  subscribeToAlerts() {
    this.subscribe("alerts")
  }

  // Add event listener
  on(event: string, handler: Function) {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, [])
    }
    this.messageHandlers.get(event)!.push(handler)
  }

  // Remove event listener
  off(event: string, handler: Function) {
    const handlers = this.messageHandlers.get(event)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  // Emit event to handlers
  private emit(event: string, data?: any) {
    const handlers = this.messageHandlers.get(event)
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data)
        } catch (error) {
          console.error(`[WebSocket] Handler error for ${event}:`, error)
        }
      })
    }
  }

  // Send ping to keep connection alive
  ping() {
    this.send({ type: "ping" })
  }

  // Update vehicle location (for admin/operator clients)
  updateVehicleLocation(
    vehicleId: number,
    location: {
      latitude: number
      longitude: number
      speed_kmh?: number
      heading?: number
    },
  ) {
    this.send({
      type: "vehicle_location_update",
      data: {
        vehicleId,
        ...location,
      },
    })
  }

  // Close connection
  disconnect() {
    this.subscriptions.clear()
    this.messageHandlers.clear()

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  // Get connection status
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  // Get subscribed channels
  get subscribedChannels(): string[] {
    return Array.from(this.subscriptions)
  }
}

// Singleton instance for global use
let globalWebSocket: VehicleTrackingWebSocket | null = null

export function getWebSocketInstance(): VehicleTrackingWebSocket {
  if (!globalWebSocket) {
    globalWebSocket = new VehicleTrackingWebSocket()
  }
  return globalWebSocket
}

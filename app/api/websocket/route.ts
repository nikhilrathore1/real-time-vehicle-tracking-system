import type { NextRequest } from "next/server"
import { WebSocketServer } from "ws"
import { verifyToken } from "@/lib/auth-utils"
import { query } from "@/lib/database"

// Global WebSocket server instance
let wss: WebSocketServer | null = null

// Client connection tracking
interface WebSocketClient {
  ws: any
  userId?: number
  subscriptions: Set<string>
  lastPing: number
}

const clients = new Map<string, WebSocketClient>()

// Initialize WebSocket server
function initWebSocketServer() {
  if (wss) return wss

  wss = new WebSocketServer({
    port: 8080,
    perMessageDeflate: false,
  })

  wss.on("connection", (ws, request) => {
    const clientId = generateClientId()
    const client: WebSocketClient = {
      ws,
      subscriptions: new Set(),
      lastPing: Date.now(),
    }

    clients.set(clientId, client)
    console.log(`[WebSocket] Client connected: ${clientId}`)

    // Handle incoming messages
    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString())
        await handleWebSocketMessage(clientId, message)
      } catch (error) {
        console.error("[WebSocket] Message parsing error:", error)
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Invalid message format",
          }),
        )
      }
    })

    // Handle client disconnect
    ws.on("close", () => {
      console.log(`[WebSocket] Client disconnected: ${clientId}`)
      clients.delete(clientId)
    })

    // Handle errors
    ws.on("error", (error) => {
      console.error(`[WebSocket] Client error ${clientId}:`, error)
      clients.delete(clientId)
    })

    // Send welcome message
    ws.send(
      JSON.stringify({
        type: "connected",
        clientId,
        message: "WebSocket connection established",
      }),
    )
  })

  // Heartbeat to keep connections alive
  setInterval(() => {
    const now = Date.now()
    clients.forEach((client, clientId) => {
      if (now - client.lastPing > 60000) {
        // 60 seconds timeout
        console.log(`[WebSocket] Removing inactive client: ${clientId}`)
        client.ws.terminate()
        clients.delete(clientId)
      } else {
        client.ws.ping()
      }
    })
  }, 30000) // Check every 30 seconds

  console.log("[WebSocket] Server started on port 8080")
  return wss
}

// Handle WebSocket messages
async function handleWebSocketMessage(clientId: string, message: any) {
  const client = clients.get(clientId)
  if (!client) return

  client.lastPing = Date.now()

  switch (message.type) {
    case "auth":
      await handleAuth(clientId, message.token)
      break

    case "subscribe":
      handleSubscribe(clientId, message.channel)
      break

    case "unsubscribe":
      handleUnsubscribe(clientId, message.channel)
      break

    case "ping":
      client.ws.send(JSON.stringify({ type: "pong" }))
      break

    case "vehicle_location_update":
      await handleVehicleLocationUpdate(message.data)
      break

    default:
      client.ws.send(
        JSON.stringify({
          type: "error",
          message: "Unknown message type",
        }),
      )
  }
}

// Handle authentication
async function handleAuth(clientId: string, token: string) {
  const client = clients.get(clientId)
  if (!client) return

  try {
    const payload = verifyToken(token)
    if (payload) {
      client.userId = payload.userId
      client.ws.send(
        JSON.stringify({
          type: "auth_success",
          userId: payload.userId,
          role: payload.role,
        }),
      )
    } else {
      client.ws.send(
        JSON.stringify({
          type: "auth_error",
          message: "Invalid token",
        }),
      )
    }
  } catch (error) {
    client.ws.send(
      JSON.stringify({
        type: "auth_error",
        message: "Authentication failed",
      }),
    )
  }
}

// Handle channel subscriptions
function handleSubscribe(clientId: string, channel: string) {
  const client = clients.get(clientId)
  if (!client) return

  client.subscriptions.add(channel)
  client.ws.send(
    JSON.stringify({
      type: "subscribed",
      channel,
    }),
  )

  console.log(`[WebSocket] Client ${clientId} subscribed to ${channel}`)
}

// Handle channel unsubscriptions
function handleUnsubscribe(clientId: string, channel: string) {
  const client = clients.get(clientId)
  if (!client) return

  client.subscriptions.delete(channel)
  client.ws.send(
    JSON.stringify({
      type: "unsubscribed",
      channel,
    }),
  )

  console.log(`[WebSocket] Client ${clientId} unsubscribed from ${channel}`)
}

// Handle vehicle location updates
async function handleVehicleLocationUpdate(data: any) {
  try {
    const { vehicleId, latitude, longitude, speed_kmh, heading } = data

    // Store location in database
    await query(
      `INSERT INTO vehicle_locations (vehicle_id, latitude, longitude, speed_kmh, heading)
       VALUES ($1, $2, $3, $4, $5)`,
      [vehicleId, latitude, longitude, speed_kmh || 0, heading || 0],
    )

    // Get vehicle and route info
    const vehicleResult = await query(
      `SELECT v.vehicle_number, r.id as route_id, r.route_number
       FROM vehicles v
       LEFT JOIN vehicle_assignments va ON v.id = va.vehicle_id AND va.is_active = true
       LEFT JOIN routes r ON va.route_id = r.id
       WHERE v.id = $1`,
      [vehicleId],
    )

    if (vehicleResult.rows.length > 0) {
      const vehicle = vehicleResult.rows[0]

      // Broadcast to subscribers
      const updateMessage = {
        type: "vehicle_location_update",
        data: {
          vehicleId,
          vehicleNumber: vehicle.vehicle_number,
          routeId: vehicle.route_id,
          routeNumber: vehicle.route_number,
          latitude,
          longitude,
          speed_kmh,
          heading,
          timestamp: new Date().toISOString(),
        },
      }

      // Send to route subscribers
      if (vehicle.route_id) {
        broadcastToChannel(`route:${vehicle.route_id}`, updateMessage)
      }

      // Send to vehicle subscribers
      broadcastToChannel(`vehicle:${vehicleId}`, updateMessage)

      // Send to general tracking subscribers
      broadcastToChannel("tracking", updateMessage)
    }
  } catch (error) {
    console.error("[WebSocket] Vehicle location update error:", error)
  }
}

// Broadcast message to channel subscribers
function broadcastToChannel(channel: string, message: any) {
  const messageStr = JSON.stringify(message)
  let sentCount = 0

  clients.forEach((client, clientId) => {
    if (client.subscriptions.has(channel)) {
      try {
        client.ws.send(messageStr)
        sentCount++
      } catch (error) {
        console.error(`[WebSocket] Send error to ${clientId}:`, error)
        clients.delete(clientId)
      }
    }
  })

  if (sentCount > 0) {
    console.log(`[WebSocket] Broadcasted to ${sentCount} clients on channel: ${channel}`)
  }
}

// Broadcast service alerts
export async function broadcastServiceAlert(alert: any) {
  const message = {
    type: "service_alert",
    data: alert,
  }

  // Broadcast to city subscribers
  if (alert.city_id) {
    broadcastToChannel(`city:${alert.city_id}`, message)
  }

  // Broadcast to route subscribers
  if (alert.route_id) {
    broadcastToChannel(`route:${alert.route_id}`, message)
  }

  // Broadcast to general alerts subscribers
  broadcastToChannel("alerts", message)
}

// Broadcast ETA updates
export async function broadcastETAUpdate(prediction: any) {
  const message = {
    type: "eta_update",
    data: prediction,
  }

  // Broadcast to stop subscribers
  broadcastToChannel(`stop:${prediction.stop_id}`, message)

  // Broadcast to route subscribers
  if (prediction.route_id) {
    broadcastToChannel(`route:${prediction.route_id}`, message)
  }
}

// Generate unique client ID
function generateClientId(): string {
  return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// HTTP endpoint for WebSocket info
export async function GET(request: NextRequest) {
  // Initialize WebSocket server if not already done
  initWebSocketServer()

  return Response.json({
    success: true,
    message: "WebSocket server is running",
    port: 8080,
    activeConnections: clients.size,
    channels: ["tracking", "alerts", "route:{routeId}", "vehicle:{vehicleId}", "stop:{stopId}", "city:{cityId}"],
  })
}

// Initialize WebSocket server on module load
initWebSocketServer()

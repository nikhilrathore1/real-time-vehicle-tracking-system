"use client"

export interface ETAPrediction {
  stopId: string
  stopName: string
  routeId: string
  busId: string
  estimatedArrival: Date
  confidence: "high" | "medium" | "low"
  delay: number // minutes
  occupancy: "low" | "medium" | "high"
  isRealTime: boolean
}

export interface ServiceAlert {
  id: string
  type: "delay" | "cancellation" | "route_change" | "disruption" | "maintenance"
  severity: "low" | "medium" | "high" | "critical"
  title: string
  description: string
  affectedRoutes: string[]
  affectedStops: string[]
  startTime: Date
  endTime?: Date
  isActive: boolean
  createdAt: Date
}

export interface BusPosition {
  busId: string
  routeId: string
  lat: number
  lng: number
  heading: number
  speed: number
  timestamp: Date
  nextStopId: string
  distanceToNextStop: number
  occupancy: "low" | "medium" | "high"
  status: "running" | "delayed" | "stopped" | "off_route"
}

class RealTimeAPI {
  private baseUrl = "http://localhost:8000/api"
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  private async fetchWithCache<T>(
    endpoint: string,
    ttl = 30000, // 30 seconds default
  ): Promise<T> {
    const cacheKey = endpoint
    const cached = this.cache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      this.cache.set(cacheKey, { data, timestamp: Date.now(), ttl })
      return data
    } catch (error) {
      // Return mock data for development
      return this.getMockData(endpoint) as T
    }
  }

  private getMockData(endpoint: string): any {
    if (endpoint.includes("/eta/")) {
      return this.generateMockETA()
    } else if (endpoint.includes("/alerts")) {
      return this.generateMockAlerts()
    } else if (endpoint.includes("/positions")) {
      return this.generateMockPositions()
    }
    return null
  }

  private generateMockETA(): ETAPrediction[] {
    const stops = [
      { id: "stop_001", name: "City Center" },
      { id: "stop_002", name: "Shopping Mall" },
      { id: "stop_003", name: "Hospital" },
      { id: "stop_004", name: "IT Park" },
    ]

    const routes = ["45A", "12B", "78C"]

    return stops.flatMap((stop) =>
      routes.slice(0, Math.floor(Math.random() * 2) + 1).map((routeId) => ({
        stopId: stop.id,
        stopName: stop.name,
        routeId,
        busId: `MH12AB${Math.floor(Math.random() * 9999)}`,
        estimatedArrival: new Date(Date.now() + Math.random() * 1800000), // 0-30 minutes
        confidence: ["high", "medium", "low"][Math.floor(Math.random() * 3)] as any,
        delay: Math.floor(Math.random() * 10) - 2, // -2 to 8 minutes
        occupancy: ["low", "medium", "high"][Math.floor(Math.random() * 3)] as any,
        isRealTime: Math.random() > 0.3,
      })),
    )
  }

  private generateMockAlerts(): ServiceAlert[] {
    const alertTypes = ["delay", "cancellation", "route_change", "disruption", "maintenance"] as const
    const severities = ["low", "medium", "high", "critical"] as const

    return Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, i) => ({
      id: `alert_${i + 1}`,
      type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      title: `Service Alert ${i + 1}`,
      description: "Traffic congestion causing delays on this route. Expected delay: 10-15 minutes.",
      affectedRoutes: ["45A", "12B"].slice(0, Math.floor(Math.random() * 2) + 1),
      affectedStops: ["stop_001", "stop_002"],
      startTime: new Date(Date.now() - Math.random() * 3600000),
      endTime: new Date(Date.now() + Math.random() * 7200000),
      isActive: true,
      createdAt: new Date(Date.now() - Math.random() * 3600000),
    }))
  }

  private generateMockPositions(): BusPosition[] {
    const routes = ["45A", "12B", "78C"]

    return Array.from({ length: Math.floor(Math.random() * 8) + 3 }, (_, i) => ({
      busId: `MH12AB${1000 + i}`,
      routeId: routes[Math.floor(Math.random() * routes.length)],
      lat: 18.5204 + (Math.random() - 0.5) * 0.1,
      lng: 73.8567 + (Math.random() - 0.5) * 0.1,
      heading: Math.floor(Math.random() * 360),
      speed: Math.floor(Math.random() * 50) + 10,
      timestamp: new Date(),
      nextStopId: `stop_${String(Math.floor(Math.random() * 6) + 1).padStart(3, "0")}`,
      distanceToNextStop: Math.random() * 2000, // meters
      occupancy: ["low", "medium", "high"][Math.floor(Math.random() * 3)] as any,
      status: ["running", "delayed", "stopped"][Math.floor(Math.random() * 3)] as any,
    }))
  }

  async getETAForStop(stopId: string): Promise<ETAPrediction[]> {
    return this.fetchWithCache<ETAPrediction[]>(`/eta/stop/${stopId}`, 15000) // 15 seconds cache
  }

  async getETAForRoute(routeId: string): Promise<ETAPrediction[]> {
    return this.fetchWithCache<ETAPrediction[]>(`/eta/route/${routeId}`, 15000)
  }

  async getServiceAlerts(): Promise<ServiceAlert[]> {
    return this.fetchWithCache<ServiceAlert[]>("/alerts", 60000) // 1 minute cache
  }

  async getActiveServiceAlerts(): Promise<ServiceAlert[]> {
    const alerts = await this.getServiceAlerts()
    return alerts.filter((alert) => alert.isActive)
  }

  async getBusPositions(routeId?: string): Promise<BusPosition[]> {
    const endpoint = routeId ? `/positions/route/${routeId}` : "/positions"
    return this.fetchWithCache<BusPosition[]>(endpoint, 5000) // 5 seconds cache
  }

  async getBusPosition(busId: string): Promise<BusPosition | null> {
    try {
      return await this.fetchWithCache<BusPosition>(`/positions/bus/${busId}`, 5000)
    } catch {
      return null
    }
  }

  clearCache(): void {
    this.cache.clear()
  }
}

export const realTimeAPI = new RealTimeAPI()

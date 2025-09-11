// Utility functions for map operations

export interface BusLocation {
  id: string
  route: string
  lat: number
  lng: number
  status: "running" | "delayed" | "stopped"
  occupancy: "low" | "medium" | "high"
  speed: number
  heading: number
  timestamp: number
}

export interface BusStop {
  id: string
  name: string
  lat: number
  lng: number
  routes: string[]
}

export interface Route {
  id: string
  name: string
  coordinates: [number, number][]
  stops: BusStop[]
  color: string
}

// Calculate distance between two points using Haversine formula
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

// Calculate ETA based on distance and average speed
export function calculateETA(distanceKm: number, averageSpeedKmh = 25): number {
  return Math.round((distanceKm / averageSpeedKmh) * 60) // Return minutes
}

// Find nearest bus stop to a given location
export function findNearestStop(userLat: number, userLng: number, stops: BusStop[]): BusStop | null {
  if (stops.length === 0) return null

  let nearestStop = stops[0]
  let minDistance = calculateDistance(userLat, userLng, stops[0].lat, stops[0].lng)

  for (let i = 1; i < stops.length; i++) {
    const distance = calculateDistance(userLat, userLng, stops[i].lat, stops[i].lng)
    if (distance < minDistance) {
      minDistance = distance
      nearestStop = stops[i]
    }
  }

  return nearestStop
}

// Generate bus status color based on status
export function getBusStatusColor(status: string): string {
  switch (status) {
    case "running":
      return "#22c55e"
    case "delayed":
      return "#eab308"
    case "stopped":
      return "#ef4444"
    default:
      return "#6b7280"
  }
}

// Generate occupancy color
export function getOccupancyColor(occupancy: string): string {
  switch (occupancy) {
    case "low":
      return "#22c55e"
    case "medium":
      return "#eab308"
    case "high":
      return "#ef4444"
    default:
      return "#6b7280"
  }
}

// Mock data generators for development
export function generateMockBuses(count = 10): BusLocation[] {
  const routes = ["45A", "12B", "78C", "33D", "56E"]
  const statuses: BusLocation["status"][] = ["running", "delayed", "stopped"]
  const occupancies: BusLocation["occupancy"][] = ["low", "medium", "high"]

  return Array.from({ length: count }, (_, i) => ({
    id: `MH12${String.fromCharCode(65 + Math.floor(i / 10))}${String.fromCharCode(65 + (i % 10))}${1000 + i}`,
    route: routes[Math.floor(Math.random() * routes.length)],
    lat: 18.5204 + (Math.random() - 0.5) * 0.1,
    lng: 73.8567 + (Math.random() - 0.5) * 0.1,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    occupancy: occupancies[Math.floor(Math.random() * occupancies.length)],
    speed: Math.floor(Math.random() * 50) + 10,
    heading: Math.floor(Math.random() * 360),
    timestamp: Date.now(),
  }))
}

export function generateMockStops(count = 20): BusStop[] {
  const stopNames = [
    "City Center",
    "Railway Station",
    "Airport",
    "Hospital",
    "University",
    "Shopping Mall",
    "IT Park",
    "Bus Stand",
    "Market Square",
    "Stadium",
    "Library",
    "Museum",
    "Park Gate",
    "School",
    "College",
    "Temple",
    "Police Station",
    "Fire Station",
    "Post Office",
    "Bank",
  ]

  return Array.from({ length: count }, (_, i) => ({
    id: `stop_${i + 1}`,
    name: stopNames[i] || `Stop ${i + 1}`,
    lat: 18.5204 + (Math.random() - 0.5) * 0.1,
    lng: 73.8567 + (Math.random() - 0.5) * 0.1,
    routes: ["45A", "12B", "78C"].slice(0, Math.floor(Math.random() * 3) + 1),
  }))
}

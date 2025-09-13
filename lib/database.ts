// Database connection and query utilities
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// Generic query function with error handling
export async function query(text: string, params?: any[]) {
  try {
    const result = await sql(text, params || [])
    return { rows: result }
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

export async function transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
  try {
    await sql("BEGIN")
    const result = await callback(sql)
    await sql("COMMIT")
    return result
  } catch (error) {
    await sql("ROLLBACK")
    throw error
  }
}

// Database models and types
export interface User {
  id: number
  email: string
  full_name: string
  phone?: string
  role: "user" | "admin" | "operator"
  is_active: boolean
  created_at: Date
}

export interface City {
  id: number
  name: string
  state: string
  country: string
  latitude?: number
  longitude?: number
  timezone: string
  is_active: boolean
}

export interface Route {
  id: number
  city_id: number
  route_number: string
  route_name: string
  description?: string
  distance_km?: number
  estimated_duration_minutes?: number
  fare?: number
  is_active: boolean
}

export interface Stop {
  id: number
  city_id: number
  stop_name: string
  stop_code?: string
  latitude: number
  longitude: number
  address?: string
  amenities: string[]
  is_accessible: boolean
  is_active: boolean
}

export interface Vehicle {
  id: number
  city_id: number
  vehicle_number: string
  vehicle_type: string
  capacity: number
  model?: string
  year_manufactured?: number
  fuel_type: string
  is_accessible: boolean
  has_ac: boolean
  has_wifi: boolean
  gps_device_id?: string
  status: "active" | "inactive" | "maintenance" | "breakdown"
}

export interface VehicleLocation {
  id: number
  vehicle_id: number
  latitude: number
  longitude: number
  speed_kmh: number
  heading: number
  accuracy_meters?: number
  timestamp: Date
}

export interface ETAPrediction {
  id: number
  vehicle_id: number
  stop_id: number
  predicted_arrival_time: Date
  confidence_level: number
  delay_minutes: number
  prediction_algorithm: string
}

export interface ServiceAlert {
  id: number
  city_id?: number
  route_id?: number
  alert_type: "delay" | "cancellation" | "diversion" | "maintenance" | "emergency"
  severity: "low" | "medium" | "high" | "critical"
  title: string
  message: string
  start_time: Date
  end_time?: Date
  is_active: boolean
  created_by: number
}

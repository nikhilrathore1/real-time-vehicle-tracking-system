import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const vehicleId = params.id
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const hours = Number.parseInt(searchParams.get("hours") || "24")

    // Get recent location history
    const result = await query(
      `
      SELECT latitude, longitude, speed_kmh, heading, timestamp
      FROM vehicle_locations
      WHERE vehicle_id = $1 
        AND timestamp >= NOW() - INTERVAL '${hours} hours'
      ORDER BY timestamp DESC
      LIMIT $2
    `,
      [vehicleId, limit],
    )

    return NextResponse.json({
      success: true,
      locations: result.rows,
    })
  } catch (error) {
    console.error("Get vehicle location error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const vehicleId = params.id
    const { latitude, longitude, speed_kmh, heading, accuracy_meters } = await request.json()

    // Validate input
    if (!latitude || !longitude) {
      return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
    }

    // Insert new location
    const result = await query(
      `
      INSERT INTO vehicle_locations (vehicle_id, latitude, longitude, speed_kmh, heading, accuracy_meters)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
      [vehicleId, latitude, longitude, speed_kmh || 0, heading || 0, accuracy_meters],
    )

    return NextResponse.json({
      success: true,
      location: result.rows[0],
    })
  } catch (error) {
    console.error("Update vehicle location error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

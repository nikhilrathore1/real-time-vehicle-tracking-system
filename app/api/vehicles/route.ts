import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cityId = searchParams.get("city_id")
    const routeId = searchParams.get("route_id")
    const status = searchParams.get("status") || "active"

    let queryText = `
      SELECT v.*, c.name as city_name, r.route_number, r.route_name,
             va.driver_name, va.driver_phone,
             vl.latitude, vl.longitude, vl.speed_kmh, vl.heading, vl.timestamp as last_location_update
      FROM vehicles v
      LEFT JOIN cities c ON v.city_id = c.id
      LEFT JOIN vehicle_assignments va ON v.id = va.vehicle_id AND va.is_active = true
      LEFT JOIN routes r ON va.route_id = r.id
      LEFT JOIN LATERAL (
        SELECT latitude, longitude, speed_kmh, heading, timestamp
        FROM vehicle_locations
        WHERE vehicle_id = v.id
        ORDER BY timestamp DESC
        LIMIT 1
      ) vl ON true
      WHERE v.status = $1
    `
    const params = [status]

    if (cityId) {
      queryText += " AND v.city_id = $2"
      params.push(cityId)
    }

    if (routeId) {
      queryText += ` AND va.route_id = $${params.length + 1}`
      params.push(routeId)
    }

    queryText += " ORDER BY v.vehicle_number"

    const result = await query(queryText, params)

    return NextResponse.json({
      success: true,
      vehicles: result.rows,
    })
  } catch (error) {
    console.error("Get vehicles error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

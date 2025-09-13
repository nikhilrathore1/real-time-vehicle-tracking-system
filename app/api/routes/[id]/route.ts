import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const routeId = params.id

    // Get route details with stops
    const routeResult = await query(
      `
      SELECT r.*, c.name as city_name
      FROM routes r
      LEFT JOIN cities c ON r.city_id = c.id
      WHERE r.id = $1 AND r.is_active = true
    `,
      [routeId],
    )

    if (routeResult.rows.length === 0) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 })
    }

    const route = routeResult.rows[0]

    // Get route stops in sequence
    const stopsResult = await query(
      `
      SELECT s.*, rs.sequence_number, rs.distance_from_start_km, rs.estimated_travel_time_minutes
      FROM route_stops rs
      JOIN stops s ON rs.stop_id = s.id
      WHERE rs.route_id = $1 AND s.is_active = true
      ORDER BY rs.sequence_number
    `,
      [routeId],
    )

    // Get active vehicles on this route
    const vehiclesResult = await query(
      `
      SELECT v.*, va.driver_name, va.driver_phone
      FROM vehicles v
      JOIN vehicle_assignments va ON v.id = va.vehicle_id
      WHERE va.route_id = $1 AND va.is_active = true AND v.status = 'active'
    `,
      [routeId],
    )

    return NextResponse.json({
      success: true,
      route: {
        ...route,
        stops: stopsResult.rows,
        vehicles: vehiclesResult.rows,
      },
    })
  } catch (error) {
    console.error("Get route details error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth, isOperatorOrAdmin } from "@/lib/auth-utils"
import { query, transaction } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    // Verify admin/operator access
    const auth = await verifyAuth(request)
    if (!auth || !isOperatorOrAdmin(auth.role)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const cityId = searchParams.get("city_id")

    let queryText = `
      SELECT r.*, c.name as city_name,
             COUNT(DISTINCT rs.stop_id) as stop_count,
             COUNT(DISTINCT va.vehicle_id) as vehicle_count
      FROM routes r
      LEFT JOIN cities c ON r.city_id = c.id
      LEFT JOIN route_stops rs ON r.id = rs.route_id
      LEFT JOIN vehicle_assignments va ON r.id = va.route_id AND va.is_active = true
      WHERE 1=1
    `
    const params: any[] = []

    if (cityId) {
      queryText += ` AND r.city_id = $${params.length + 1}`
      params.push(cityId)
    }

    queryText += `
      GROUP BY r.id, c.name
      ORDER BY r.route_number
    `

    const result = await query(queryText, params)

    return NextResponse.json({
      success: true,
      routes: result.rows,
    })
  } catch (error) {
    console.error("Admin get routes error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin/operator access
    const auth = await verifyAuth(request)
    if (!auth || !isOperatorOrAdmin(auth.role)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { city_id, route_number, route_name, description, distance_km, estimated_duration_minutes, fare, stops } =
      await request.json()

    // Validate required fields
    if (!city_id || !route_number || !route_name) {
      return NextResponse.json({ error: "City ID, route number, and route name are required" }, { status: 400 })
    }

    // Check if route number already exists in the city
    const existingRoute = await query("SELECT id FROM routes WHERE city_id = $1 AND route_number = $2", [
      city_id,
      route_number,
    ])

    if (existingRoute.rows.length > 0) {
      return NextResponse.json({ error: "Route number already exists in this city" }, { status: 409 })
    }

    // Create route with stops in transaction
    const result = await transaction(async (client) => {
      // Create route
      const routeResult = await client.query(
        `INSERT INTO routes (city_id, route_number, route_name, description, distance_km, estimated_duration_minutes, fare)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [city_id, route_number, route_name, description, distance_km, estimated_duration_minutes, fare],
      )

      const newRoute = routeResult.rows[0]

      // Add stops if provided
      if (stops && Array.isArray(stops)) {
        for (let i = 0; i < stops.length; i++) {
          const stop = stops[i]
          await client.query(
            `INSERT INTO route_stops (route_id, stop_id, sequence_number, distance_from_start_km, estimated_travel_time_minutes)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              newRoute.id,
              stop.stop_id,
              i + 1,
              stop.distance_from_start_km || 0,
              stop.estimated_travel_time_minutes || 0,
            ],
          )
        }
      }

      return newRoute
    })

    return NextResponse.json({
      success: true,
      route: result,
    })
  } catch (error) {
    console.error("Admin create route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

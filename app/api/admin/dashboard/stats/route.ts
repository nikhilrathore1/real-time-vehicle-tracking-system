import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth, isOperatorOrAdmin } from "@/lib/auth-utils"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    // Verify admin/operator access
    const auth = await verifyAuth(request)
    if (!auth || !isOperatorOrAdmin(auth.role)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const cityId = searchParams.get("city_id")

    // Build base conditions
    let cityCondition = ""
    const params: any[] = []

    if (cityId) {
      cityCondition = "WHERE city_id = $1"
      params.push(cityId)
    }

    // Get overall statistics
    const statsQueries = [
      // Total vehicles by status
      `SELECT status, COUNT(*) as count FROM vehicles ${cityCondition} GROUP BY status`,

      // Total routes
      `SELECT COUNT(*) as total_routes FROM routes ${cityCondition.replace("city_id", "r.city_id")}`,

      // Total stops
      `SELECT COUNT(*) as total_stops FROM stops ${cityCondition}`,

      // Active alerts
      `SELECT COUNT(*) as active_alerts FROM service_alerts 
       WHERE is_active = true AND (end_time IS NULL OR end_time > NOW()) 
       ${cityId ? "AND (city_id = $1 OR city_id IS NULL)" : ""}`,

      // Recent location updates (last hour)
      `SELECT COUNT(DISTINCT vehicle_id) as vehicles_with_recent_updates 
       FROM vehicle_locations vl
       ${cityId ? "JOIN vehicles v ON vl.vehicle_id = v.id WHERE v.city_id = $1 AND" : "WHERE"} 
       vl.timestamp > NOW() - INTERVAL '1 hour'`,
    ]

    const results = await Promise.all(statsQueries.map((sql) => query(sql, cityId ? [cityId] : [])))

    // Process vehicle status counts
    const vehicleStatusCounts = results[0].rows.reduce((acc: any, row: any) => {
      acc[row.status] = Number.parseInt(row.count)
      return acc
    }, {})

    // Get performance metrics
    const performanceResult = await query(
      `
      SELECT 
        AVG(speed_kmh) as avg_speed,
        COUNT(*) as total_location_updates,
        COUNT(DISTINCT vehicle_id) as active_vehicles
      FROM vehicle_locations vl
      ${cityId ? "JOIN vehicles v ON vl.vehicle_id = v.id WHERE v.city_id = $1 AND" : "WHERE"}
      vl.timestamp > NOW() - INTERVAL '24 hours'
    `,
      cityId ? [cityId] : [],
    )

    const performance = performanceResult.rows[0]

    return NextResponse.json({
      success: true,
      stats: {
        vehicles: {
          total: Object.values(vehicleStatusCounts).reduce((a: any, b: any) => a + b, 0),
          by_status: vehicleStatusCounts,
          with_recent_updates: Number.parseInt(results[4].rows[0].vehicles_with_recent_updates),
        },
        routes: {
          total: Number.parseInt(results[1].rows[0].total_routes),
        },
        stops: {
          total: Number.parseInt(results[2].rows[0].total_stops),
        },
        alerts: {
          active: Number.parseInt(results[3].rows[0].active_alerts),
        },
        performance: {
          avg_speed_kmh: Number.parseFloat(performance.avg_speed) || 0,
          total_location_updates_24h: Number.parseInt(performance.total_location_updates),
          active_vehicles_24h: Number.parseInt(performance.active_vehicles),
        },
      },
    })
  } catch (error) {
    console.error("Admin dashboard stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

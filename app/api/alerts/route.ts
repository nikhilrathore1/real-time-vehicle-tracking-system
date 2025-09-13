import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cityId = searchParams.get("city_id")
    const routeId = searchParams.get("route_id")
    const severity = searchParams.get("severity")

    let queryText = `
      SELECT sa.*, c.name as city_name, r.route_number, r.route_name,
             u.full_name as created_by_name
      FROM service_alerts sa
      LEFT JOIN cities c ON sa.city_id = c.id
      LEFT JOIN routes r ON sa.route_id = r.id
      LEFT JOIN users u ON sa.created_by = u.id
      WHERE sa.is_active = true 
        AND (sa.end_time IS NULL OR sa.end_time > NOW())
    `
    const params: any[] = []

    if (cityId) {
      queryText += ` AND (sa.city_id = $${params.length + 1} OR sa.city_id IS NULL)`
      params.push(cityId)
    }

    if (routeId) {
      queryText += ` AND (sa.route_id = $${params.length + 1} OR sa.route_id IS NULL)`
      params.push(routeId)
    }

    if (severity) {
      queryText += ` AND sa.severity = $${params.length + 1}`
      params.push(severity)
    }

    queryText += " ORDER BY sa.severity DESC, sa.start_time DESC"

    const result = await query(queryText, params)

    return NextResponse.json({
      success: true,
      alerts: result.rows,
    })
  } catch (error) {
    console.error("Get alerts error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

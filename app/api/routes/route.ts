import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cityId = searchParams.get("city_id")
    const isActive = searchParams.get("active") !== "false"

    let queryText = `
      SELECT r.*, c.name as city_name,
             COUNT(DISTINCT rs.stop_id) as stop_count
      FROM routes r
      LEFT JOIN cities c ON r.city_id = c.id
      LEFT JOIN route_stops rs ON r.id = rs.route_id
      WHERE r.is_active = $1
    `
    const params = [isActive]

    if (cityId) {
      queryText += " AND r.city_id = $2"
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
    console.error("Get routes error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

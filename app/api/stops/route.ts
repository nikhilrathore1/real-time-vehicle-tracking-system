import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cityId = searchParams.get("city_id")
    const routeId = searchParams.get("route_id")
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")
    const radius = Number.parseFloat(searchParams.get("radius") || "1000") // meters

    let queryText = `
      SELECT s.*, c.name as city_name
    `
    const params: any[] = []

    // Add distance calculation if coordinates provided
    if (lat && lng) {
      queryText += `, 
        (6371000 * acos(cos(radians($${params.length + 1})) * cos(radians(s.latitude)) * 
         cos(radians(s.longitude) - radians($${params.length + 2})) + 
         sin(radians($${params.length + 1})) * sin(radians(s.latitude)))) as distance_meters
      `
      params.push(Number.parseFloat(lat), Number.parseFloat(lng))
    }

    queryText += `
      FROM stops s
      LEFT JOIN cities c ON s.city_id = c.id
      WHERE s.is_active = true
    `

    if (cityId) {
      queryText += ` AND s.city_id = $${params.length + 1}`
      params.push(cityId)
    }

    if (routeId) {
      queryText += ` AND EXISTS (
        SELECT 1 FROM route_stops rs 
        WHERE rs.stop_id = s.id AND rs.route_id = $${params.length + 1}
      )`
      params.push(routeId)
    }

    // Filter by radius if coordinates provided
    if (lat && lng) {
      queryText += ` 
        HAVING (6371000 * acos(cos(radians($1)) * cos(radians(s.latitude)) * 
                cos(radians(s.longitude) - radians($2)) + 
                sin(radians($1)) * sin(radians(s.latitude)))) <= $${params.length + 1}
      `
      params.push(radius)
      queryText += " ORDER BY distance_meters"
    } else {
      queryText += " ORDER BY s.stop_name"
    }

    const result = await query(queryText, params)

    return NextResponse.json({
      success: true,
      stops: result.rows,
    })
  } catch (error) {
    console.error("Get stops error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

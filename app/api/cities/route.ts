import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const result = await query(`
      SELECT c.*, 
             COUNT(DISTINCT r.id) as route_count,
             COUNT(DISTINCT v.id) as vehicle_count
      FROM cities c
      LEFT JOIN routes r ON c.id = r.city_id AND r.is_active = true
      LEFT JOIN vehicles v ON c.id = v.city_id AND v.status = 'active'
      WHERE c.is_active = true
      GROUP BY c.id
      ORDER BY c.name
    `)

    return NextResponse.json({
      success: true,
      cities: result.rows,
    })
  } catch (error) {
    console.error("Get cities error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

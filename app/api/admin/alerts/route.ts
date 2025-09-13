import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth, isOperatorOrAdmin } from "@/lib/auth-utils"
import { query } from "@/lib/database"
import { broadcastServiceAlert } from "@/app/api/websocket/route"

export async function GET(request: NextRequest) {
  try {
    // Verify admin/operator access
    const auth = await verifyAuth(request)
    if (!auth || !isOperatorOrAdmin(auth.role)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const cityId = searchParams.get("city_id")
    const isActive = searchParams.get("active") !== "false"

    let queryText = `
      SELECT sa.*, c.name as city_name, r.route_number, r.route_name,
             u.full_name as created_by_name
      FROM service_alerts sa
      LEFT JOIN cities c ON sa.city_id = c.id
      LEFT JOIN routes r ON sa.route_id = r.id
      LEFT JOIN users u ON sa.created_by = u.id
      WHERE sa.is_active = $1
    `
    const params = [isActive]

    if (cityId) {
      queryText += ` AND (sa.city_id = $${params.length + 1} OR sa.city_id IS NULL)`
      params.push(cityId)
    }

    queryText += " ORDER BY sa.created_at DESC"

    const result = await query(queryText, params)

    return NextResponse.json({
      success: true,
      alerts: result.rows,
    })
  } catch (error) {
    console.error("Admin get alerts error:", error)
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

    const { city_id, route_id, alert_type, severity, title, message, end_time } = await request.json()

    // Validate required fields
    if (!alert_type || !severity || !title || !message) {
      return NextResponse.json({ error: "Alert type, severity, title, and message are required" }, { status: 400 })
    }

    // Validate alert type and severity
    const validAlertTypes = ["delay", "cancellation", "diversion", "maintenance", "emergency"]
    const validSeverities = ["low", "medium", "high", "critical"]

    if (!validAlertTypes.includes(alert_type)) {
      return NextResponse.json({ error: "Invalid alert type" }, { status: 400 })
    }

    if (!validSeverities.includes(severity)) {
      return NextResponse.json({ error: "Invalid severity level" }, { status: 400 })
    }

    // Create alert
    const result = await query(
      `INSERT INTO service_alerts (city_id, route_id, alert_type, severity, title, message, end_time, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [city_id, route_id, alert_type, severity, title, message, end_time, auth.userId],
    )

    const newAlert = result.rows[0]

    // Broadcast alert via WebSocket
    await broadcastServiceAlert(newAlert)

    return NextResponse.json({
      success: true,
      alert: newAlert,
    })
  } catch (error) {
    console.error("Admin create alert error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

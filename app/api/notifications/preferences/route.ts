import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth-utils"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request)
    if (!auth) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Get user's notification preferences
    const result = await query(
      `SELECT route_alerts, delay_notifications, arrival_reminders, 
              service_updates, marketing_notifications
       FROM notification_preferences
       WHERE user_id = $1`,
      [auth.userId],
    )

    let preferences
    if (result.rows.length === 0) {
      // Create default preferences
      const defaultPrefs = await query(
        `INSERT INTO notification_preferences (user_id)
         VALUES ($1)
         RETURNING route_alerts, delay_notifications, arrival_reminders, 
                   service_updates, marketing_notifications`,
        [auth.userId],
      )
      preferences = defaultPrefs.rows[0]
    } else {
      preferences = result.rows[0]
    }

    return NextResponse.json({
      success: true,
      preferences,
    })
  } catch (error) {
    console.error("Get notification preferences error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request)
    if (!auth) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { route_alerts, delay_notifications, arrival_reminders, service_updates, marketing_notifications } =
      await request.json()

    // Update preferences
    const result = await query(
      `INSERT INTO notification_preferences 
       (user_id, route_alerts, delay_notifications, arrival_reminders, service_updates, marketing_notifications)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         route_alerts = EXCLUDED.route_alerts,
         delay_notifications = EXCLUDED.delay_notifications,
         arrival_reminders = EXCLUDED.arrival_reminders,
         service_updates = EXCLUDED.service_updates,
         marketing_notifications = EXCLUDED.marketing_notifications,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [auth.userId, route_alerts, delay_notifications, arrival_reminders, service_updates, marketing_notifications],
    )

    return NextResponse.json({
      success: true,
      preferences: result.rows[0],
    })
  } catch (error) {
    console.error("Update notification preferences error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

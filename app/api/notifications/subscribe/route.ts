import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth-utils"
import { query } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request)
    if (!auth) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { endpoint, keys } = await request.json()

    // Validate subscription data
    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return NextResponse.json({ error: "Invalid subscription data" }, { status: 400 })
    }

    // Check if subscription already exists
    const existingSubscription = await query("SELECT id FROM push_subscriptions WHERE user_id = $1 AND endpoint = $2", [
      auth.userId,
      endpoint,
    ])

    if (existingSubscription.rows.length > 0) {
      // Update existing subscription
      await query(
        `UPDATE push_subscriptions 
         SET p256dh_key = $1, auth_key = $2, is_active = true, created_at = CURRENT_TIMESTAMP
         WHERE user_id = $3 AND endpoint = $4`,
        [keys.p256dh, keys.auth, auth.userId, endpoint],
      )
    } else {
      // Create new subscription
      await query(
        `INSERT INTO push_subscriptions (user_id, endpoint, p256dh_key, auth_key, user_agent)
         VALUES ($1, $2, $3, $4, $5)`,
        [auth.userId, endpoint, keys.p256dh, keys.auth, request.headers.get("user-agent")],
      )
    }

    return NextResponse.json({
      success: true,
      message: "Push notification subscription saved",
    })
  } catch (error) {
    console.error("Subscribe to push notifications error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request)
    if (!auth) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { endpoint } = await request.json()

    if (!endpoint) {
      return NextResponse.json({ error: "Endpoint is required" }, { status: 400 })
    }

    // Deactivate subscription
    await query("UPDATE push_subscriptions SET is_active = false WHERE user_id = $1 AND endpoint = $2", [
      auth.userId,
      endpoint,
    ])

    return NextResponse.json({
      success: true,
      message: "Push notification subscription removed",
    })
  } catch (error) {
    console.error("Unsubscribe from push notifications error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

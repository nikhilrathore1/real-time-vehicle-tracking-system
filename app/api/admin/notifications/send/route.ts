import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth, isOperatorOrAdmin } from "@/lib/auth-utils"
import {
  sendPushNotificationToUsers,
  sendCityWideNotification,
  sendRouteNotification,
  type NotificationPayload,
} from "@/lib/push-notification-service"

export async function POST(request: NextRequest) {
  try {
    // Verify admin/operator access
    const auth = await verifyAuth(request)
    if (!auth || !isOperatorOrAdmin(auth.role)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { type, target, title, body, data, actions } = await request.json()

    // Validate required fields
    if (!type || !title || !body) {
      return NextResponse.json({ error: "Type, title, and body are required" }, { status: 400 })
    }

    const payload: NotificationPayload = {
      title,
      body,
      icon: "/icons/icon-192x192.png",
      data: data || {},
      actions: actions || [],
      tag: `admin-${Date.now()}`,
    }

    let result: { sent: number; failed: number }

    switch (type) {
      case "city":
        if (!target.cityId) {
          return NextResponse.json({ error: "City ID is required for city notifications" }, { status: 400 })
        }
        result = await sendCityWideNotification(target.cityId, payload)
        break

      case "route":
        if (!target.routeId) {
          return NextResponse.json({ error: "Route ID is required for route notifications" }, { status: 400 })
        }
        result = await sendRouteNotification(target.routeId, payload)
        break

      case "users":
        if (!target.userIds || !Array.isArray(target.userIds)) {
          return NextResponse.json({ error: "User IDs array is required for user notifications" }, { status: 400 })
        }
        result = await sendPushNotificationToUsers(target.userIds, payload)
        break

      default:
        return NextResponse.json({ error: "Invalid notification type" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: `Notification sent to ${result.sent} users, ${result.failed} failed`,
      stats: result,
    })
  } catch (error) {
    console.error("Admin send notification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

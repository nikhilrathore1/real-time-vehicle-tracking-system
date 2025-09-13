import webpush from "web-push"
import { query } from "./database"

// Configure web-push with VAPID keys
const vapidPublicKey =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  "BEl62iUYgUivxIkv69yViEuiBIa40HI80NM9f8HnKJuOmLWjMpS_7VnYkYdYWjAlBEhOcgLXyMhqYAioEGgrtQM"
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "your-vapid-private-key"
const vapidEmail = process.env.VAPID_EMAIL || "admin@vehicletracking.com"

webpush.setVapidDetails(`mailto:${vapidEmail}`, vapidPublicKey, vapidPrivateKey)

export interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  image?: string
  data?: any
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
  tag?: string
  requireInteraction?: boolean
}

// Send push notification to a single subscription
export async function sendPushNotification(
  subscription: PushSubscription,
  payload: NotificationPayload,
): Promise<boolean> {
  try {
    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || "/icons/icon-192x192.png",
      badge: payload.badge || "/icons/badge-72x72.png",
      image: payload.image,
      data: payload.data || {},
      actions: payload.actions || [],
      tag: payload.tag,
      requireInteraction: payload.requireInteraction || false,
      timestamp: Date.now(),
    })

    await webpush.sendNotification(subscription, notificationPayload)
    return true
  } catch (error) {
    console.error("Push notification send error:", error)
    return false
  }
}

// Send push notification to multiple users
export async function sendPushNotificationToUsers(
  userIds: number[],
  payload: NotificationPayload,
): Promise<{ sent: number; failed: number }> {
  if (userIds.length === 0) return { sent: 0, failed: 0 }

  try {
    // Get active push subscriptions for users
    const subscriptionsResult = await query(
      `SELECT user_id, endpoint, p256dh_key, auth_key
       FROM push_subscriptions
       WHERE user_id = ANY($1) AND is_active = true`,
      [userIds],
    )

    const subscriptions = subscriptionsResult.rows
    let sent = 0
    let failed = 0

    // Send notifications concurrently
    const promises = subscriptions.map(async (sub) => {
      const subscription: PushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh_key,
          auth: sub.auth_key,
        },
      }

      const success = await sendPushNotification(subscription, payload)
      if (success) {
        sent++
      } else {
        failed++
        // Mark subscription as inactive if it failed
        await query("UPDATE push_subscriptions SET is_active = false WHERE user_id = $1 AND endpoint = $2", [
          sub.user_id,
          sub.endpoint,
        ])
      }
    })

    await Promise.all(promises)
    return { sent, failed }
  } catch (error) {
    console.error("Bulk push notification error:", error)
    return { sent: 0, failed: userIds.length }
  }
}

// Send notification to all users in a city
export async function sendCityWideNotification(
  cityId: number,
  payload: NotificationPayload,
): Promise<{ sent: number; failed: number }> {
  try {
    // Get all users who have favorites in this city or general users
    const usersResult = await query(
      `SELECT DISTINCT u.id
       FROM users u
       LEFT JOIN user_favorites uf ON u.id = uf.user_id
       LEFT JOIN routes r ON uf.route_id = r.id
       LEFT JOIN stops s ON uf.stop_id = s.id
       WHERE u.is_active = true 
         AND (r.city_id = $1 OR s.city_id = $1 OR (uf.id IS NULL))`,
      [cityId],
    )

    const userIds = usersResult.rows.map((row) => row.id)
    return await sendPushNotificationToUsers(userIds, payload)
  } catch (error) {
    console.error("City-wide notification error:", error)
    return { sent: 0, failed: 0 }
  }
}

// Send notification to users subscribed to a specific route
export async function sendRouteNotification(
  routeId: number,
  payload: NotificationPayload,
): Promise<{ sent: number; failed: number }> {
  try {
    // Get users who have this route in favorites
    const usersResult = await query(
      `SELECT DISTINCT uf.user_id
       FROM user_favorites uf
       JOIN users u ON uf.user_id = u.id
       WHERE uf.route_id = $1 AND u.is_active = true`,
      [routeId],
    )

    const userIds = usersResult.rows.map((row) => row.user_id)
    return await sendPushNotificationToUsers(userIds, payload)
  } catch (error) {
    console.error("Route notification error:", error)
    return { sent: 0, failed: 0 }
  }
}

// Send ETA notification to users waiting at a stop
export async function sendETANotification(
  stopId: number,
  vehicleId: number,
  etaMinutes: number,
): Promise<{ sent: number; failed: number }> {
  try {
    // Get vehicle and route info
    const vehicleResult = await query(
      `SELECT v.vehicle_number, r.route_number, r.route_name, s.stop_name
       FROM vehicles v
       JOIN vehicle_assignments va ON v.id = va.vehicle_id AND va.is_active = true
       JOIN routes r ON va.route_id = r.id
       JOIN stops s ON s.id = $2
       WHERE v.id = $1`,
      [vehicleId, stopId],
    )

    if (vehicleResult.rows.length === 0) {
      return { sent: 0, failed: 0 }
    }

    const vehicle = vehicleResult.rows[0]

    // Get users who have this stop in favorites
    const usersResult = await query(
      `SELECT DISTINCT uf.user_id
       FROM user_favorites uf
       JOIN users u ON uf.user_id = u.id
       WHERE uf.stop_id = $1 AND u.is_active = true`,
      [stopId],
    )

    const payload: NotificationPayload = {
      title: `Bus Arriving Soon`,
      body: `${vehicle.route_number} (${vehicle.vehicle_number}) arriving at ${vehicle.stop_name} in ${etaMinutes} minutes`,
      icon: "/icons/bus-icon.png",
      tag: `eta-${stopId}-${vehicleId}`,
      data: {
        type: "eta_update",
        stopId,
        vehicleId,
        routeId: vehicle.route_id,
        etaMinutes,
      },
      actions: [
        {
          action: "view_route",
          title: "View Route",
        },
      ],
    }

    const userIds = usersResult.rows.map((row) => row.user_id)
    return await sendPushNotificationToUsers(userIds, payload)
  } catch (error) {
    console.error("ETA notification error:", error)
    return { sent: 0, failed: 0 }
  }
}

// Send service alert notification
export async function sendServiceAlertNotification(alert: any): Promise<{ sent: number; failed: number }> {
  try {
    let userIds: number[] = []

    if (alert.route_id) {
      // Send to users subscribed to this route
      const routeUsersResult = await query(
        `SELECT DISTINCT uf.user_id
         FROM user_favorites uf
         JOIN users u ON uf.user_id = u.id
         WHERE uf.route_id = $1 AND u.is_active = true`,
        [alert.route_id],
      )
      userIds = routeUsersResult.rows.map((row) => row.user_id)
    } else if (alert.city_id) {
      // Send city-wide
      const cityUsersResult = await query(
        `SELECT DISTINCT u.id
         FROM users u
         LEFT JOIN user_favorites uf ON u.id = uf.user_id
         LEFT JOIN routes r ON uf.route_id = r.id
         LEFT JOIN stops s ON uf.stop_id = s.id
         WHERE u.is_active = true 
           AND (r.city_id = $1 OR s.city_id = $1 OR (uf.id IS NULL))`,
        [alert.city_id],
      )
      userIds = cityUsersResult.rows.map((row) => row.id)
    }

    const payload: NotificationPayload = {
      title: alert.title,
      body: alert.message,
      icon: getSeverityIcon(alert.severity),
      tag: `alert-${alert.id}`,
      requireInteraction: alert.severity === "critical",
      data: {
        type: "service_alert",
        alertId: alert.id,
        alertType: alert.alert_type,
        severity: alert.severity,
        routeId: alert.route_id,
        cityId: alert.city_id,
      },
      actions: [
        {
          action: "view_alert",
          title: "View Details",
        },
      ],
    }

    return await sendPushNotificationToUsers(userIds, payload)
  } catch (error) {
    console.error("Service alert notification error:", error)
    return { sent: 0, failed: 0 }
  }
}

// Get icon based on alert severity
function getSeverityIcon(severity: string): string {
  switch (severity) {
    case "critical":
      return "/icons/alert-critical.png"
    case "high":
      return "/icons/alert-high.png"
    case "medium":
      return "/icons/alert-medium.png"
    case "low":
      return "/icons/alert-low.png"
    default:
      return "/icons/alert-default.png"
  }
}

// Clean up expired subscriptions
export async function cleanupExpiredSubscriptions(): Promise<number> {
  try {
    const result = await query(
      `DELETE FROM push_subscriptions 
       WHERE is_active = false 
         AND created_at < NOW() - INTERVAL '30 days'
       RETURNING id`,
    )

    console.log(`Cleaned up ${result.rows.length} expired push subscriptions`)
    return result.rows.length
  } catch (error) {
    console.error("Cleanup expired subscriptions error:", error)
    return 0
  }
}

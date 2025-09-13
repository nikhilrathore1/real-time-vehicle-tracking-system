// Background job processor for handling notification triggers
import { query } from "./database"
import { sendETANotification, sendServiceAlertNotification } from "./push-notification-service"

export class NotificationProcessor {
  private isProcessing = false
  private intervalId: NodeJS.Timeout | null = null

  // Start processing notifications
  start(intervalMs = 5000) {
    if (this.intervalId) {
      console.log("[NotificationProcessor] Already running")
      return
    }

    console.log("[NotificationProcessor] Starting notification processor")
    this.intervalId = setInterval(() => {
      this.processNotifications()
    }, intervalMs)
  }

  // Stop processing notifications
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      console.log("[NotificationProcessor] Stopped notification processor")
    }
  }

  // Process pending notifications
  private async processNotifications() {
    if (this.isProcessing) return

    this.isProcessing = true

    try {
      // Get unprocessed notifications
      const result = await query(
        `SELECT id, type, data
         FROM notification_log
         WHERE processed = false
         ORDER BY created_at ASC
         LIMIT 10`,
      )

      for (const notification of result.rows) {
        await this.processNotification(notification)
      }
    } catch (error) {
      console.error("[NotificationProcessor] Error processing notifications:", error)
    } finally {
      this.isProcessing = false
    }
  }

  // Process individual notification
  private async processNotification(notification: any) {
    try {
      const { id, type, data } = notification

      switch (type) {
        case "eta_notification":
          await this.processETANotification(data)
          break

        case "service_alert_notification":
          await this.processServiceAlertNotification(data)
          break

        default:
          console.warn(`[NotificationProcessor] Unknown notification type: ${type}`)
      }

      // Mark as processed
      await query("UPDATE notification_log SET processed = true WHERE id = $1", [id])

      console.log(`[NotificationProcessor] Processed notification ${id} (${type})`)
    } catch (error) {
      console.error(`[NotificationProcessor] Error processing notification ${notification.id}:`, error)

      // Mark as processed to avoid infinite retries (could implement retry logic here)
      await query("UPDATE notification_log SET processed = true WHERE id = $1", [notification.id])
    }
  }

  // Process ETA notification
  private async processETANotification(data: any) {
    const { vehicle_id, stop_id, eta_minutes } = data

    if (eta_minutes <= 10) {
      // Only send if ETA is 10 minutes or less
      await sendETANotification(stop_id, vehicle_id, Math.round(eta_minutes))
    }
  }

  // Process service alert notification
  private async processServiceAlertNotification(data: any) {
    const { alert_id } = data

    // Get full alert details
    const alertResult = await query("SELECT * FROM service_alerts WHERE id = $1", [alert_id])

    if (alertResult.rows.length > 0) {
      await sendServiceAlertNotification(alertResult.rows[0])
    }
  }
}

// Global processor instance
let globalProcessor: NotificationProcessor | null = null

export function getNotificationProcessor(): NotificationProcessor {
  if (!globalProcessor) {
    globalProcessor = new NotificationProcessor()
  }
  return globalProcessor
}

// Auto-start processor in production
if (process.env.NODE_ENV === "production") {
  const processor = getNotificationProcessor()
  processor.start()
}

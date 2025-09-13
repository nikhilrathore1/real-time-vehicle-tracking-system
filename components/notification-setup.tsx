"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Bell, BellOff, Smartphone, AlertTriangle, CheckCircle } from "lucide-react"
import {
  pushNotificationManager,
  triggerBusArrivalNotification,
  triggerServiceAlertNotification,
} from "@/lib/push-notifications"

export function NotificationSetup() {
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [preferences, setPreferences] = useState({
    busArrivals: true,
    serviceAlerts: true,
    routeChanges: false,
    maintenance: false,
  })

  useEffect(() => {
    checkNotificationStatus()
  }, [])

  const checkNotificationStatus = async () => {
    if ("Notification" in window) {
      setPermission(Notification.permission)

      const subscription = await pushNotificationManager.getSubscription()
      setIsSubscribed(!!subscription)
    }
  }

  const handleEnableNotifications = async () => {
    setIsLoading(true)

    try {
      const initialized = await pushNotificationManager.initialize()
      if (!initialized) {
        throw new Error("Failed to initialize service worker")
      }

      const subscription = await pushNotificationManager.subscribe()
      if (!subscription) {
        throw new Error("Failed to create push subscription")
      }

      const saved = await pushNotificationManager.saveSubscriptionToServer(subscription, {
        routeIds: ["45A", "12B"], // Demo routes
        stopIds: ["stop_001", "stop_002"], // Demo stops
        alertTypes: Object.entries(preferences)
          .filter(([_, enabled]) => enabled)
          .map(([type, _]) => type),
      })

      if (saved) {
        setIsSubscribed(true)
        setPermission("granted")
      }
    } catch (error) {
      console.error("Failed to enable notifications:", error)
      alert("Failed to enable notifications. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisableNotifications = async () => {
    setIsLoading(true)

    try {
      await pushNotificationManager.unsubscribe()
      await pushNotificationManager.removeSubscriptionFromServer()
      setIsSubscribed(false)
    } catch (error) {
      console.error("Failed to disable notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreferenceChange = (key: string, value: boolean) => {
    setPreferences((prev) => ({ ...prev, [key]: value }))
  }

  const testNotification = () => {
    if (preferences.busArrivals) {
      triggerBusArrivalNotification("45A", "City Center", 3)
    }

    if (preferences.serviceAlerts) {
      setTimeout(() => {
        triggerServiceAlertNotification("Route Delay", "Traffic congestion causing 10-minute delays on Route 12B", [
          "12B",
        ])
      }, 2000)
    }
  }

  const getPermissionStatus = () => {
    switch (permission) {
      case "granted":
        return { icon: CheckCircle, color: "text-green-600", text: "Enabled" }
      case "denied":
        return { icon: BellOff, color: "text-red-600", text: "Blocked" }
      default:
        return { icon: Bell, color: "text-yellow-600", text: "Not Set" }
    }
  }

  const status = getPermissionStatus()
  const StatusIcon = status.icon

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Push Notifications
          </div>
          <Badge variant={permission === "granted" ? "default" : "secondary"} className="text-xs">
            <StatusIcon className="h-3 w-3 mr-1" />
            {status.text}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {permission === "denied" && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-center gap-2 text-destructive mb-1">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium text-sm">Notifications Blocked</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Please enable notifications in your browser settings to receive bus alerts.
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Enable Push Notifications</Label>
              <p className="text-xs text-muted-foreground">Get real-time alerts about your buses</p>
            </div>
            {!isSubscribed ? (
              <Button onClick={handleEnableNotifications} disabled={isLoading || permission === "denied"} size="sm">
                {isLoading ? "Enabling..." : "Enable"}
              </Button>
            ) : (
              <Button onClick={handleDisableNotifications} disabled={isLoading} variant="outline" size="sm">
                {isLoading ? "Disabling..." : "Disable"}
              </Button>
            )}
          </div>

          {isSubscribed && (
            <>
              <div className="border-t pt-4 space-y-4">
                <h4 className="font-medium text-sm">Notification Preferences</h4>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">Bus Arrivals</Label>
                      <p className="text-xs text-muted-foreground">Alerts when your bus is approaching</p>
                    </div>
                    <Switch
                      checked={preferences.busArrivals}
                      onCheckedChange={(checked) => handlePreferenceChange("busArrivals", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">Service Alerts</Label>
                      <p className="text-xs text-muted-foreground">Delays, cancellations, and disruptions</p>
                    </div>
                    <Switch
                      checked={preferences.serviceAlerts}
                      onCheckedChange={(checked) => handlePreferenceChange("serviceAlerts", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">Route Changes</Label>
                      <p className="text-xs text-muted-foreground">New routes and schedule updates</p>
                    </div>
                    <Switch
                      checked={preferences.routeChanges}
                      onCheckedChange={(checked) => handlePreferenceChange("routeChanges", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">Maintenance Alerts</Label>
                      <p className="text-xs text-muted-foreground">Planned maintenance and service updates</p>
                    </div>
                    <Switch
                      checked={preferences.maintenance}
                      onCheckedChange={(checked) => handlePreferenceChange("maintenance", checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <Button onClick={testNotification} variant="outline" size="sm" className="w-full bg-transparent">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Test Notifications
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

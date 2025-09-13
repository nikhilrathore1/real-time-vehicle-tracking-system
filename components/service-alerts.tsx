"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useServiceAlerts } from "@/hooks/use-service-alerts"
import { AlertTriangle, Info, Construction, XCircle, Clock, RefreshCw, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useState } from "react"

export function ServiceAlerts() {
  const { alerts, loading, error, lastUpdated, refresh } = useServiceAlerts(true)
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "delay":
        return Clock
      case "cancellation":
        return XCircle
      case "route_change":
        return Info
      case "disruption":
        return AlertTriangle
      case "maintenance":
        return Construction
      default:
        return Info
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "low":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "delay":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "cancellation":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "route_change":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "disruption":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "maintenance":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts((prev) => new Set([...prev, alertId]))
  }

  const visibleAlerts = alerts.filter((alert) => !dismissedAlerts.has(alert.id))

  if (visibleAlerts.length === 0 && !loading && !error) {
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Service Alerts
            {visibleAlerts.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {visibleAlerts.length} active
              </Badge>
            )}
          </div>
          <Button size="sm" variant="ghost" onClick={refresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </CardTitle>
        {lastUpdated && (
          <p className="text-xs text-muted-foreground">
            Last updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {loading && alerts.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <AlertTriangle className="h-6 w-6 mx-auto mb-2 animate-pulse" />
            <p className="text-sm">Loading service alerts...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-4 text-destructive">
            <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
            <p className="text-sm">{error}</p>
            <Button size="sm" variant="outline" onClick={refresh} className="mt-2 bg-transparent">
              Try Again
            </Button>
          </div>
        )}

        {visibleAlerts.length > 0
          ? visibleAlerts
              .sort((a, b) => {
                const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
                return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0)
              })
              .map((alert) => {
                const AlertIcon = getAlertIcon(alert.type)

                return (
                  <div key={alert.id} className="p-3 rounded-lg border border-border bg-card relative">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 h-6 w-6 p-0"
                      onClick={() => dismissAlert(alert.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>

                    <div className="flex items-start gap-3 pr-8">
                      <div className="p-1 rounded-full bg-muted">
                        <AlertIcon className="h-4 w-4 text-muted-foreground" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{alert.title}</h4>
                          <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                          <Badge className={getTypeColor(alert.type)}>{alert.type.replace("_", " ")}</Badge>
                        </div>

                        <p className="text-xs text-muted-foreground mb-2">{alert.description}</p>

                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <div>
                              <span className="text-muted-foreground">Routes: </span>
                              <span className="font-medium">{alert.affectedRoutes.join(", ")}</span>
                            </div>

                            <div className="text-muted-foreground">
                              Started {formatDistanceToNow(alert.startTime, { addSuffix: true })}
                            </div>
                          </div>

                          {alert.endTime && (
                            <div className="text-muted-foreground">
                              Until{" "}
                              {alert.endTime.toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
          : !loading &&
            !error && (
              <div className="text-center py-6 text-muted-foreground">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No active service alerts</p>
                <p className="text-xs">All services are running normally</p>
              </div>
            )}
      </CardContent>
    </Card>
  )
}

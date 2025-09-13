"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRealTimeETA } from "@/hooks/use-real-time-eta"
import { Clock, RefreshCw, MapPin, Users, AlertTriangle, CheckCircle, Bell } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface RealTimeETAProps {
  stopId?: string
  routeId?: string
  title?: string
}

export function RealTimeETA({ stopId, routeId, title = "Live Arrivals" }: RealTimeETAProps) {
  const { predictions, loading, error, lastUpdated, refresh } = useRealTimeETA(stopId, routeId)

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high":
        return "text-green-600"
      case "medium":
        return "text-yellow-600"
      case "low":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getOccupancyColor = (occupancy: string) => {
    switch (occupancy) {
      case "low":
        return "text-green-600"
      case "medium":
        return "text-yellow-600"
      case "high":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getDelayStatus = (delay: number) => {
    if (delay <= 0) return { icon: CheckCircle, color: "text-green-600", text: "On time" }
    if (delay <= 5) return { icon: Clock, color: "text-yellow-600", text: `${delay}m delay` }
    return { icon: AlertTriangle, color: "text-red-600", text: `${delay}m delay` }
  }

  const formatETA = (arrivalTime: Date) => {
    const now = new Date()
    const diffMinutes = Math.floor((arrivalTime.getTime() - now.getTime()) / 60000)

    if (diffMinutes <= 0) return "Arriving now"
    if (diffMinutes === 1) return "1 minute"
    if (diffMinutes < 60) return `${diffMinutes} minutes`

    return arrivalTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            {title}
            {predictions.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {predictions.length} arrivals
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
        {loading && predictions.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <Clock className="h-6 w-6 mx-auto mb-2 animate-pulse" />
            <p className="text-sm">Loading live arrivals...</p>
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

        {predictions.length > 0
          ? predictions
              .sort((a, b) => a.estimatedArrival.getTime() - b.estimatedArrival.getTime())
              .map((prediction, index) => {
                const delayStatus = getDelayStatus(prediction.delay)
                const DelayIcon = delayStatus.icon

                return (
                  <div
                    key={`${prediction.busId}-${index}`}
                    className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-medium">
                          {prediction.routeId}
                        </Badge>
                        {!stopId && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {prediction.stopName}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-primary">{formatETA(prediction.estimatedArrival)}</div>
                        <div className="text-xs text-muted-foreground">Bus {prediction.busId.slice(-4)}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <DelayIcon className={`h-3 w-3 ${delayStatus.color}`} />
                          <span className={delayStatus.color}>{delayStatus.text}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Users className={`h-3 w-3 ${getOccupancyColor(prediction.occupancy)}`} />
                          <span className={getOccupancyColor(prediction.occupancy)}>{prediction.occupancy}</span>
                        </div>

                        <div className={`flex items-center gap-1 ${getConfidenceColor(prediction.confidence)}`}>
                          <span>{prediction.confidence} confidence</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {prediction.isRealTime && (
                          <Badge variant="secondary" className="text-xs">
                            Live
                          </Badge>
                        )}
                        <Button size="sm" variant="ghost" className="h-6 px-2">
                          <Bell className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })
          : !loading &&
            !error && (
              <div className="text-center py-6 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No arrivals scheduled</p>
                <p className="text-xs">Check back later or try a different stop</p>
              </div>
            )}
      </CardContent>
    </Card>
  )
}

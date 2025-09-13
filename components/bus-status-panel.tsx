"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bus, Users, AlertTriangle } from "lucide-react"

const activeBuses = [
  {
    id: "MH12AB1234",
    route: "45A",
    status: "running",
    occupancy: "medium",
    delay: 0,
    nextStop: "City Center",
  },
  {
    id: "MH12CD5678",
    route: "12B",
    status: "delayed",
    occupancy: "high",
    delay: 8,
    nextStop: "Railway Station",
  },
  {
    id: "MH12EF9012",
    route: "78C",
    status: "running",
    occupancy: "low",
    delay: 0,
    nextStop: "University Gate",
  },
]

export function BusStatusPanel() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "delayed":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "stopped":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bus className="h-5 w-5 text-primary" />
          Active Buses
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activeBuses.map((bus) => (
          <div key={bus.id} className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-medium text-sm">{bus.id}</div>
                <div className="text-xs text-muted-foreground">Route {bus.route}</div>
              </div>
              <Badge className={getStatusColor(bus.status)}>{bus.status}</Badge>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Next Stop:</span>
                <span className="font-medium">{bus.nextStop}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Occupancy:</span>
                <div className="flex items-center gap-1">
                  <Users className={`h-3 w-3 ${getOccupancyColor(bus.occupancy)}`} />
                  <span className={getOccupancyColor(bus.occupancy)}>{bus.occupancy}</span>
                </div>
              </div>

              {bus.delay > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Delay:</span>
                  <div className="flex items-center gap-1 text-yellow-600">
                    <AlertTriangle className="h-3 w-3" />
                    <span>{bus.delay} min</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

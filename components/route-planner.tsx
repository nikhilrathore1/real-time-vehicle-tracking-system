"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowRight, MapPin, Clock, IndianRupee, RouteIcon, Accessibility } from "lucide-react"
import { findRoutesBetweenStops, type Route } from "@/lib/route-data"

export function RoutePlanner() {
  const [fromStop, setFromStop] = useState("")
  const [toStop, setToStop] = useState("")
  const [routes, setRoutes] = useState<Route[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    if (!fromStop.trim() || !toStop.trim()) return

    setIsSearching(true)
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const foundRoutes = findRoutesBetweenStops(fromStop, toStop)
    setRoutes(foundRoutes)
    setIsSearching(false)
  }

  const getRouteTypeColor = (type: string) => {
    switch (type) {
      case "express":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "limited":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RouteIcon className="h-5 w-5 text-primary" />
          Route Planner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-600" />
            <Input
              placeholder="From (starting point)"
              value={fromStop}
              onChange={(e) => setFromStop(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-600" />
            <Input
              placeholder="To (destination)"
              value={toStop}
              onChange={(e) => setToStop(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Button onClick={handleSearch} className="w-full" disabled={isSearching || !fromStop.trim() || !toStop.trim()}>
          {isSearching ? "Searching..." : "Find Routes"}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>

        {routes.length > 0 && (
          <div className="space-y-4">
            <Separator />
            <h4 className="font-medium text-sm">Available Routes ({routes.length})</h4>

            {routes.map((route) => (
              <div key={route.id} className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary text-lg">{route.id}</span>
                    <Badge className={getRouteTypeColor(route.type)}>{route.type}</Badge>
                    {route.stops.some((stop) => stop.accessibility) && (
                      <Accessibility className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <IndianRupee className="h-3 w-3" />
                      {route.fare}
                    </div>
                  </div>
                </div>

                <h3 className="font-medium text-sm mb-2">{route.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{route.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <div className="flex items-center gap-1 font-medium">
                      <Clock className="h-3 w-3" />
                      {route.estimatedDuration} min
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Distance:</span>
                    <div className="font-medium">{route.distance} km</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Frequency:</span>
                    <div className="font-medium">Every {route.frequency} min</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Hours:</span>
                    <div className="font-medium">
                      {route.operatingHours.start} - {route.operatingHours.end}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    View Details
                  </Button>
                  <Button size="sm" className="flex-1">
                    Track Live
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {routes.length === 0 && fromStop && toStop && !isSearching && (
          <div className="text-center py-6 text-muted-foreground">
            <RouteIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No direct routes found</p>
            <p className="text-xs">Try searching for nearby stops or alternative routes</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

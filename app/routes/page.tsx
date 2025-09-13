"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { RouteSearch } from "@/components/route-search"
import { RouteDetails } from "@/components/route-details"
import { RouteMap } from "@/components/route-map"
import { RouteScheduleComponent } from "@/components/route-schedule"
import { StopDetails } from "@/components/stop-details"
import { getRouteById } from "@/lib/route-data"

export default function RoutesPage() {
  const [selectedRouteId, setSelectedRouteId] = useState<string>("45A")
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null)

  const selectedRoute = getRouteById(selectedRouteId)
  const selectedStop = selectedRoute?.stops.find((stop) => stop.id === selectedStopId)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground text-balance">Bus Routes</h1>
            <p className="text-muted-foreground text-pretty">Explore routes, stops, and schedules</p>
          </div>

          <RouteSearch />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              {selectedRoute && <RouteDetails />}
              {selectedRoute && <RouteScheduleComponent route={selectedRoute} />}
            </div>
            <div className="space-y-6">
              <RouteMap />
              {selectedStop && (
                <StopDetails
                  stop={selectedStop}
                  onNavigate={() => console.log("Navigate to stop")}
                  onSetAlert={() => console.log("Set alert for stop")}
                  onAddFavorite={() => console.log("Add stop to favorites")}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

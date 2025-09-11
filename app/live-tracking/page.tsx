"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { LiveMap } from "@/components/live-map"
import { BusStatusPanel } from "@/components/bus-status-panel"
import { RealTimeETA } from "@/components/real-time-eta"
import { ServiceAlerts } from "@/components/service-alerts"
import { RealTimeUpdates } from "@/components/real-time-updates"

export default function LiveTrackingPage() {
  const [selectedBus, setSelectedBus] = useState<string | null>(null)
  const [selectedStop, setSelectedStop] = useState<string | null>("stop_001")

  const handleBusUpdate = (busData: any) => {
    // Handle real-time bus updates
    console.log("Bus update received:", busData)
  }

  const handleRouteDisruption = (disruption: any) => {
    // Handle route disruption notifications
    console.log("Route disruption:", disruption)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground text-balance">Live Bus Tracking</h1>
            <p className="text-muted-foreground text-pretty">Track buses in real-time with live ETA predictions</p>
          </div>

          <ServiceAlerts />

          <RealTimeUpdates onBusUpdate={handleBusUpdate} onRouteDisruption={handleRouteDisruption} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <LiveMap />
            </div>
            <div className="space-y-4">
              <BusStatusPanel />
              <RealTimeETA stopId={selectedStop || undefined} title="Live Arrivals" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

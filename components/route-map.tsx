"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Map, Navigation, Layers } from "lucide-react"

// Mock route data
const routeData = {
  id: "45A",
  name: "City Center - Airport Express",
  coordinates: [
    [18.5204, 73.8567], // City Center
    [18.5234, 73.8587], // Shopping Mall
    [18.5264, 73.8607], // Hospital
    [18.5294, 73.8627], // IT Park
    [18.5324, 73.8647], // Airport Terminal 1
    [18.5354, 73.8667], // Airport Terminal 2
  ],
  stops: [
    { name: "City Center", lat: 18.5204, lng: 73.8567, order: 1 },
    { name: "Shopping Mall", lat: 18.5234, lng: 73.8587, order: 2 },
    { name: "Hospital", lat: 18.5264, lng: 73.8607, order: 3 },
    { name: "IT Park", lat: 18.5294, lng: 73.8627, order: 4 },
    { name: "Airport Terminal 1", lat: 18.5324, lng: 73.8647, order: 5 },
    { name: "Airport Terminal 2", lat: 18.5354, lng: 73.8667, order: 6 },
  ],
}

export function RouteMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [selectedStop, setSelectedStop] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && mapRef.current && !map) {
      import("leaflet").then((L) => {
        // Initialize map centered on route
        const mapInstance = L.map(mapRef.current!).setView([18.5279, 73.8607], 12)

        // Add OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(mapInstance)

        // Draw route line
        const routeLine = L.polyline(routeData.coordinates, {
          color: "#059669",
          weight: 4,
          opacity: 0.8,
          smoothFactor: 1,
        }).addTo(mapInstance)

        // Fit map to route bounds
        mapInstance.fitBounds(routeLine.getBounds(), { padding: [20, 20] })

        // Add stop markers
        routeData.stops.forEach((stop, index) => {
          const isFirst = index === 0
          const isLast = index === routeData.stops.length - 1

          const stopIcon = L.divIcon({
            html: `<div class="stop-marker ${isFirst ? "first" : isLast ? "last" : "middle"}">
                     <div class="stop-number">${stop.order}</div>
                   </div>`,
            className: "stop-icon",
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          })

          const marker = L.marker([stop.lat, stop.lng], { icon: stopIcon })
            .addTo(mapInstance)
            .bindPopup(`
              <div class="stop-popup">
                <h3 class="font-semibold">${stop.name}</h3>
                <p class="text-sm">Stop ${stop.order} of ${routeData.stops.length}</p>
                <p class="text-sm">Route: ${routeData.id}</p>
              </div>
            `)

          marker.on("click", () => {
            setSelectedStop(stop.name)
          })
        })

        // Add direction arrows along the route
        const arrowIcon = L.divIcon({
          html: `<div class="route-arrow">→</div>`,
          className: "arrow-icon",
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        })

        // Add arrows at intervals along the route
        for (let i = 0; i < routeData.coordinates.length - 1; i++) {
          const start = routeData.coordinates[i]
          const end = routeData.coordinates[i + 1]
          const midLat = (start[0] + end[0]) / 2
          const midLng = (start[1] + end[1]) / 2

          L.marker([midLat, midLng], { icon: arrowIcon }).addTo(mapInstance)
        }

        setMap(mapInstance)
      })
    }

    return () => {
      if (map) {
        map.remove()
      }
    }
  }, [map])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Map className="h-5 w-5 text-primary" />
            Route Map
            <Badge variant="outline" className="text-xs">
              {routeData.id}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <Layers className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline">
              <Navigation className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative h-[400px] rounded-lg overflow-hidden">
          <div ref={mapRef} className="w-full h-full" />

          {/* Route info overlay */}
          <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 text-xs z-[1000]">
            <h4 className="font-medium mb-2">{routeData.name}</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Starting point</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Bus stops</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>End point</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-primary"></div>
                <span>Route path</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <style jsx global>{`
        .stop-marker {
          background: white;
          border-radius: 50%;
          border: 3px solid #059669;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          font-weight: bold;
          font-size: 10px;
        }
        
        .stop-marker.first {
          background: #22c55e;
          color: white;
          border-color: #22c55e;
        }
        
        .stop-marker.last {
          background: #ef4444;
          color: white;
          border-color: #ef4444;
        }
        
        .stop-marker.middle {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }
        
        .stop-number {
          font-size: 10px;
          font-weight: bold;
        }
        
        .route-arrow {
          color: #059669;
          font-size: 12px;
          font-weight: bold;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #059669;
        }
        
        .stop-popup {
          min-width: 150px;
        }
      `}</style>
    </Card>
  )
}

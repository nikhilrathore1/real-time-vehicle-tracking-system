"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Layers, ZoomIn, ZoomOut, Locate } from "lucide-react"
import { useWebSocket } from "@/hooks/use-websocket"

interface BusLocation {
  id: string
  vehicle_number: string
  route_id: string
  latitude: number
  longitude: number
  status: string
  speed_kmh: number
  heading: number
  occupancy?: string
}

export function LiveMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [buses, setBuses] = useState<BusLocation[]>([])
  const [selectedBus, setSelectedBus] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const { isConnected, subscribe } = useWebSocket()

  useEffect(() => {
    fetchBusLocations()
  }, [])

  useEffect(() => {
    if (isConnected) {
      const unsubscribe = subscribe("busLocationUpdate", (data: BusLocation) => {
        setBuses((prev) => {
          const updated = prev.filter((bus) => bus.id !== data.id)
          return [...updated, data]
        })

        // Update map marker if map is loaded
        if (map) {
          updateBusMarker(data)
        }
      })

      return unsubscribe
    }
  }, [isConnected, subscribe, map])

  const fetchBusLocations = async () => {
    try {
      const response = await fetch("/api/vehicles?status=active")
      if (response.ok) {
        const data = await response.json()
        setBuses(data)
      }
    } catch (error) {
      console.error("Failed to fetch bus locations:", error)
    }
  }

  const updateBusMarker = (busData: BusLocation) => {
    // Update existing marker or create new one
    // This would be implemented with the specific map library
    console.log("[v0] Updating bus marker:", busData)
  }

  useEffect(() => {
    if (typeof window !== "undefined" && mapRef.current && !map) {
      // Dynamic import of Leaflet to avoid SSR issues
      import("leaflet").then((L) => {
        // Initialize map
        const mapInstance = L.map(mapRef.current!).setView([18.5204, 73.8567], 13)

        // Add OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(mapInstance)

        // Custom bus icon
        const busIcon = L.divIcon({
          html: `<div class="bus-marker running">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                     <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
                   </svg>
                 </div>`,
          className: "bus-icon",
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        })

        buses.forEach((bus) => {
          const marker = L.marker([bus.latitude, bus.longitude], { icon: busIcon })
            .addTo(mapInstance)
            .bindPopup(`
              <div class="bus-popup">
                <h3 class="font-semibold">${bus.vehicle_number}</h3>
                <p class="text-sm">Route: ${bus.route_id}</p>
                <p class="text-sm">Status: ${bus.status}</p>
                <p class="text-sm">Speed: ${bus.speed_kmh} km/h</p>
                ${bus.occupancy ? `<p class="text-sm">Occupancy: ${bus.occupancy}</p>` : ""}
              </div>
            `)

          marker.on("click", () => {
            setSelectedBus(bus.id)
          })
        })

        setMap(mapInstance)

        // Get user location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords
              setUserLocation({ lat: latitude, lng: longitude })

              // Add user location marker
              const userIcon = L.divIcon({
                html: `<div class="user-marker">
                         <div class="user-dot"></div>
                         <div class="user-pulse"></div>
                       </div>`,
                className: "user-location-icon",
                iconSize: [20, 20],
                iconAnchor: [10, 10],
              })

              L.marker([latitude, longitude], { icon: userIcon }).addTo(mapInstance).bindPopup("Your Location")
            },
            (error) => {
              console.log("Location access denied:", error)
            },
          )
        }
      })
    }

    return () => {
      if (map) {
        map.remove()
      }
    }
  }, [map, buses])

  const centerOnUser = () => {
    if (map && userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 15)
    }
  }

  const zoomIn = () => {
    if (map) {
      map.zoomIn()
    }
  }

  const zoomOut = () => {
    if (map) {
      map.zoomOut()
    }
  }

  return (
    <Card className="h-[500px]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Live Bus Map
            <Badge variant="secondary" className="text-xs">
              {buses.length} buses active
            </Badge>
            {isConnected && (
              <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                Live
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={centerOnUser}>
              <Locate className="h-4 w-4" />
            </Button>
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

          {/* Map controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
            <Button size="sm" variant="secondary" onClick={zoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="secondary" onClick={zoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 text-xs z-[1000]">
            <h4 className="font-medium mb-2">Bus Status</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Running on time</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Delayed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Stopped</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Your location</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <style jsx global>{`
        .bus-marker {
          color: #059669;
          background: white;
          border-radius: 50%;
          border: 2px solid #059669;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        
        .bus-marker.delayed {
          color: #eab308;
          border-color: #eab308;
        }
        
        .bus-marker.stopped {
          color: #ef4444;
          border-color: #ef4444;
        }
        
        .user-marker {
          position: relative;
        }
        
        .user-dot {
          width: 12px;
          height: 12px;
          background: #3b82f6;
          border: 2px solid white;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 2;
        }
        
        .user-pulse {
          width: 20px;
          height: 20px;
          background: rgba(59, 130, 246, 0.3);
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }
        
        .bus-popup {
          min-width: 150px;
        }
        
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }
        
        .leaflet-popup-tip {
          background: white;
        }
      `}</style>
    </Card>
  )
}

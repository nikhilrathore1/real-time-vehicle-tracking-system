"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Clock, Accessibility, Wifi, Armchair, Monitor, Home, Bell, Star, Navigation } from "lucide-react"
import type { BusStop } from "@/lib/route-data"

interface StopDetailsProps {
  stop: BusStop
  onNavigate?: () => void
  onSetAlert?: () => void
  onAddFavorite?: () => void
}

export function StopDetails({ stop, onNavigate, onSetAlert, onAddFavorite }: StopDetailsProps) {
  const [isFavorite, setIsFavorite] = useState(false)

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case "shelter":
        return <Home className="h-4 w-4" />
      case "seating":
        return <Armchair className="h-4 w-4" />
      case "digital_display":
        return <Monitor className="h-4 w-4" />
      case "wifi":
        return <Wifi className="h-4 w-4" />
      case "wheelchair_access":
        return <Accessibility className="h-4 w-4" />
      default:
        return <MapPin className="h-4 w-4" />
    }
  }

  const getAmenityLabel = (amenity: string) => {
    switch (amenity) {
      case "shelter":
        return "Shelter"
      case "seating":
        return "Seating"
      case "digital_display":
        return "Digital Display"
      case "wifi":
        return "WiFi"
      case "wheelchair_access":
        return "Wheelchair Access"
      case "ticket_counter":
        return "Ticket Counter"
      case "restroom":
        return "Restroom"
      default:
        return amenity.replace("_", " ")
    }
  }

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite)
    onAddFavorite?.()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            {stop.name}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant={isFavorite ? "default" : "outline"} onClick={handleFavoriteToggle}>
              <Star className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
            </Button>
            <Button size="sm" variant="outline" onClick={onNavigate}>
              <Navigation className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">Stop ID: {stop.id}</div>

        <div>
          <h4 className="font-medium mb-2">Routes Serving This Stop</h4>
          <div className="flex flex-wrap gap-2">
            {stop.routes.map((routeId) => (
              <Badge key={routeId} variant="outline">
                {routeId}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            Amenities & Facilities
            {stop.accessibility && (
              <Badge variant="secondary" className="text-xs">
                <Accessibility className="h-3 w-3 mr-1" />
                Accessible
              </Badge>
            )}
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {stop.amenities.map((amenity) => (
              <div key={amenity} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-sm">
                {getAmenityIcon(amenity)}
                <span>{getAmenityLabel(amenity)}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Live Arrivals
          </h4>
          <div className="space-y-2">
            {stop.routes.map((routeId, index) => (
              <div key={routeId} className="flex items-center justify-between p-2 rounded-lg border border-border">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{routeId}</Badge>
                  <span className="text-sm">Next arrival</span>
                </div>
                <div className="text-sm font-medium text-primary">{Math.floor(Math.random() * 15) + 2} min</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1" onClick={onSetAlert}>
            <Bell className="h-4 w-4 mr-2" />
            Set Alert
          </Button>
          <Button variant="outline" className="flex-1 bg-transparent">
            View on Map
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

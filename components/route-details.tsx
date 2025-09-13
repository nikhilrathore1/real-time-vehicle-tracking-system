"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Star, Bell } from "lucide-react"

const routeInfo = {
  id: "45A",
  name: "City Center - Airport Express",
  frequency: "15 min",
  operatingHours: "5:00 AM - 11:00 PM",
  fare: "₹25",
  distance: "18.5 km",
  stops: [
    { name: "City Center", time: "5:00 AM", isActive: true },
    { name: "Shopping Mall", time: "5:08 AM", isActive: false },
    { name: "Hospital", time: "5:15 AM", isActive: false },
    { name: "IT Park", time: "5:25 AM", isActive: false },
    { name: "Airport Terminal 1", time: "5:35 AM", isActive: false },
    { name: "Airport Terminal 2", time: "5:40 AM", isActive: false },
  ],
}

export function RouteDetails() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-primary font-bold">{routeInfo.id}</span>
            <span>{routeInfo.name}</span>
          </div>
          <Button size="sm" variant="outline">
            <Star className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Frequency:</span>
            <div className="font-medium">{routeInfo.frequency}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Operating Hours:</span>
            <div className="font-medium">{routeInfo.operatingHours}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Fare:</span>
            <div className="font-medium">{routeInfo.fare}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Distance:</span>
            <div className="font-medium">{routeInfo.distance}</div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Bus Stops
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {routeInfo.stops.map((stop, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-2 rounded-lg border ${
                  stop.isActive ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${stop.isActive ? "bg-primary" : "bg-muted-foreground"}`} />
                  <div>
                    <div className="font-medium text-sm">{stop.name}</div>
                    <div className="text-xs text-muted-foreground">{stop.time}</div>
                  </div>
                </div>
                <div className="flex gap-1">
                  {stop.isActive && (
                    <Badge variant="secondary" className="text-xs">
                      Next
                    </Badge>
                  )}
                  <Button size="sm" variant="ghost">
                    <Bell className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1">Track Live</Button>
          <Button variant="outline" className="flex-1 bg-transparent">
            Set Alerts
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

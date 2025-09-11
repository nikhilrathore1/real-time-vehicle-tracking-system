"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, Clock, MapPin, Bell } from "lucide-react"

const favoriteRoutes = [
  { id: "1", name: "Route 45A", from: "City Center", to: "Airport", nextBus: "5 min" },
  { id: "2", name: "Route 12B", from: "Railway Station", to: "IT Park", nextBus: "12 min" },
  { id: "3", name: "Route 78C", from: "Bus Stand", to: "University", nextBus: "8 min" },
]

export function QuickAccess() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          Quick Access
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {favoriteRoutes.length > 0 ? (
          favoriteRoutes.map((route) => (
            <div
              key={route.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <div className="font-medium text-sm">{route.name}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {route.from} → {route.to}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Next bus</div>
                  <div className="text-sm font-medium text-primary flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {route.nextBus}
                  </div>
                </div>
                <Button size="sm" variant="ghost">
                  <Bell className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No favorite routes yet</p>
            <p className="text-xs">Add routes to see them here</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

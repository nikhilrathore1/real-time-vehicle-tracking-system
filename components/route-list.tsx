"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Clock, Users, Star } from "lucide-react"

const routes = [
  {
    id: "45A",
    name: "City Center - Airport Express",
    from: "City Center",
    to: "Airport",
    frequency: "15 min",
    status: "running",
    occupancy: "medium",
    nextBus: "5 min",
    isFavorite: true,
  },
  {
    id: "12B",
    name: "Railway Station - IT Park",
    from: "Railway Station",
    to: "IT Park",
    frequency: "10 min",
    status: "running",
    occupancy: "high",
    nextBus: "12 min",
    isFavorite: false,
  },
  {
    id: "78C",
    name: "Bus Stand - University",
    from: "Bus Stand",
    to: "University",
    frequency: "20 min",
    status: "delayed",
    occupancy: "low",
    nextBus: "25 min",
    isFavorite: true,
  },
  {
    id: "33D",
    name: "Hospital - Shopping Mall",
    from: "Hospital",
    to: "Shopping Mall",
    frequency: "12 min",
    status: "running",
    occupancy: "medium",
    nextBus: "8 min",
    isFavorite: false,
  },
]

export function RouteList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<"all" | "favorites">("all")

  const filteredRoutes = routes.filter((route) => {
    const matchesSearch =
      route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filter === "all" || (filter === "favorites" && route.isFavorite)

    return matchesSearch && matchesFilter
  })

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
        <CardTitle>Available Routes</CardTitle>
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search routes, stops, or route numbers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
              All Routes
            </Button>
            <Button
              variant={filter === "favorites" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("favorites")}
            >
              <Star className="h-4 w-4 mr-1" />
              Favorites
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {filteredRoutes.length > 0 ? (
          filteredRoutes.map((route) => (
            <div key={route.id} className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-primary">{route.id}</span>
                    <Badge className={getStatusColor(route.status)}>{route.status}</Badge>
                    {route.isFavorite && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                  </div>
                  <h3 className="font-medium text-sm mb-1">{route.name}</h3>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {route.from} → {route.to}
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-xs text-muted-foreground">Next bus</div>
                  <div className="text-sm font-medium text-primary flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {route.nextBus}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">Frequency: {route.frequency}</span>
                  <div className="flex items-center gap-1">
                    <Users className={`h-3 w-3 ${getOccupancyColor(route.occupancy)}`} />
                    <span className={getOccupancyColor(route.occupancy)}>{route.occupancy} occupancy</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    View Route
                  </Button>
                  <Button size="sm">Track Live</Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No routes found</p>
            <p className="text-xs">Try adjusting your search or filters</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

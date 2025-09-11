"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, RouteIcon, Clock } from "lucide-react"
import { searchRoutes, type Route, mockRoutes } from "@/lib/route-data"
import { RoutePlanner } from "./route-planner"

export function RouteSearch() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Route[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [activeTab, setActiveTab] = useState("search")

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    const timeoutId = setTimeout(() => {
      const results = searchRoutes(searchTerm)
      setSearchResults(results)
      setIsSearching(false)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

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
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">Search Routes</TabsTrigger>
            <TabsTrigger value="planner">Route Planner</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search routes by number, name, or stops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Badge variant="outline" className="text-xs">
                {mockRoutes.length} total routes
              </Badge>
            </div>

            {isSearching && (
              <div className="text-center py-4 text-muted-foreground">
                <Search className="h-6 w-6 mx-auto mb-2 animate-pulse" />
                <p className="text-sm">Searching routes...</p>
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Search Results ({searchResults.length})</h4>
                {searchResults.map((route) => (
                  <div
                    key={route.id}
                    className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary text-lg">{route.id}</span>
                        <Badge className={getRouteTypeColor(route.type)}>{route.type}</Badge>
                      </div>
                      <div className="text-right text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {route.estimatedDuration} min
                        </div>
                      </div>
                    </div>

                    <h3 className="font-medium text-sm mb-1">{route.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{route.description}</p>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">Frequency: Every {route.frequency} min</span>
                        <span className="text-muted-foreground">Fare: ₹{route.fare}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                        <Button size="sm">Track Live</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchTerm && !isSearching && searchResults.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <RouteIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No routes found for "{searchTerm}"</p>
                <p className="text-xs">Try different keywords or check spelling</p>
              </div>
            )}

            {!searchTerm && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Popular Routes</h4>
                {mockRoutes.slice(0, 3).map((route) => (
                  <div
                    key={route.id}
                    className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary">{route.id}</span>
                        <span className="text-sm">{route.name}</span>
                      </div>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="planner">
            <RoutePlanner />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

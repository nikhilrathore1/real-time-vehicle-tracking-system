"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, MapPin, Clock, Users, Edit } from "lucide-react"

interface RouteData {
  id: string
  name: string
  code: string
  stops: number
  distance: string
  duration: string
  frequency: string
  activeBuses: number
  status: "active" | "suspended" | "maintenance"
}

const mockRoutes: RouteData[] = [
  {
    id: "1",
    name: "City Center - Airport",
    code: "15A",
    stops: 12,
    distance: "18.5 km",
    duration: "45 min",
    frequency: "Every 10 min",
    activeBuses: 8,
    status: "active",
  },
  {
    id: "2",
    name: "Railway Station - IT Park",
    code: "22B",
    stops: 15,
    distance: "22.3 km",
    duration: "55 min",
    frequency: "Every 15 min",
    activeBuses: 6,
    status: "active",
  },
  {
    id: "3",
    name: "Hospital - University",
    code: "8C",
    stops: 8,
    distance: "12.1 km",
    duration: "30 min",
    frequency: "Every 20 min",
    activeBuses: 4,
    status: "maintenance",
  },
]

export function RouteManagement() {
  const [routes, setRoutes] = useState<RouteData[]>(mockRoutes)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const filteredRoutes = routes.filter(
    (route) =>
      route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "suspended":
        return "bg-red-100 text-red-800"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Route Management</h2>
          <p className="text-muted-foreground">Manage bus routes and schedules</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Route
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Route</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="routeName">Route Name</Label>
                  <Input id="routeName" placeholder="City Center - Airport" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="routeCode">Route Code</Label>
                  <Input id="routeCode" placeholder="15A" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="routeDescription">Description</Label>
                <Textarea id="routeDescription" placeholder="Route description and key landmarks" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="distance">Distance (km)</Label>
                  <Input id="distance" type="number" placeholder="18.5" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (min)</Label>
                  <Input id="duration" type="number" placeholder="45" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency (min)</Label>
                  <Input id="frequency" type="number" placeholder="10" />
                </div>
              </div>
              <Button className="w-full">Create Route</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search routes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Stops</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Active Buses</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoutes.map((route) => (
                <TableRow key={route.id}>
                  <TableCell className="font-medium">{route.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{route.code}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {route.stops}
                    </div>
                  </TableCell>
                  <TableCell>{route.distance}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {route.duration}
                    </div>
                  </TableCell>
                  <TableCell>{route.frequency}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {route.activeBuses}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(route.status)}>{route.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

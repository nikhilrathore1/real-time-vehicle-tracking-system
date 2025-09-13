"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, MapPin, Users, Fuel, Settings } from "lucide-react"

interface BusData {
  id: string
  number: string
  route: string
  status: "active" | "maintenance" | "offline"
  location: string
  passengers: number
  capacity: number
  fuel: number
  driver: string
}

const mockBuses: BusData[] = [
  {
    id: "1",
    number: "KA-01-AB-1234",
    route: "Route 15A",
    status: "active",
    location: "MG Road",
    passengers: 32,
    capacity: 45,
    fuel: 75,
    driver: "Rajesh Kumar",
  },
  {
    id: "2",
    number: "KA-01-AB-5678",
    route: "Route 22B",
    status: "maintenance",
    location: "Depot",
    passengers: 0,
    capacity: 45,
    fuel: 20,
    driver: "Suresh Patel",
  },
  {
    id: "3",
    number: "KA-01-AB-9012",
    route: "Route 8C",
    status: "active",
    location: "City Center",
    passengers: 28,
    capacity: 40,
    fuel: 60,
    driver: "Amit Singh",
  },
]

export function BusManagement() {
  const [buses, setBuses] = useState<BusData[]>(mockBuses)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const filteredBuses = buses.filter(
    (bus) =>
      bus.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.driver.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800"
      case "offline":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Fleet Management</h2>
          <p className="text-muted-foreground">Monitor and manage your bus fleet</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Bus
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Bus</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="busNumber">Bus Number</Label>
                <Input id="busNumber" placeholder="KA-01-AB-1234" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="route">Assigned Route</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select route" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15A">Route 15A</SelectItem>
                    <SelectItem value="22B">Route 22B</SelectItem>
                    <SelectItem value="8C">Route 8C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input id="capacity" type="number" placeholder="45" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="driver">Driver Name</Label>
                <Input id="driver" placeholder="Driver name" />
              </div>
              <Button className="w-full">Add Bus</Button>
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
                placeholder="Search buses..."
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
                <TableHead>Bus Number</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Occupancy</TableHead>
                <TableHead>Fuel</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBuses.map((bus) => (
                <TableRow key={bus.id}>
                  <TableCell className="font-medium">{bus.number}</TableCell>
                  <TableCell>{bus.route}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(bus.status)}>{bus.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {bus.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {bus.passengers}/{bus.capacity}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Fuel className="h-3 w-3" />
                      {bus.fuel}%
                    </div>
                  </TableCell>
                  <TableCell>{bus.driver}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
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

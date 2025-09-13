"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Plus, X, Clock, MapPin } from "lucide-react"

interface Alert {
  id: string
  title: string
  description: string
  severity: "low" | "medium" | "high" | "critical"
  route?: string
  location?: string
  timestamp: string
  status: "active" | "resolved"
}

const mockAlerts: Alert[] = [
  {
    id: "1",
    title: "Route 15A Delayed",
    description: "Heavy traffic on MG Road causing 15-minute delays",
    severity: "medium",
    route: "15A",
    location: "MG Road",
    timestamp: "2024-01-15 14:30",
    status: "active",
  },
  {
    id: "2",
    title: "Bus Breakdown",
    description: "Bus KA-01-AB-5678 requires immediate maintenance",
    severity: "high",
    route: "22B",
    location: "City Center",
    timestamp: "2024-01-15 13:45",
    status: "active",
  },
  {
    id: "3",
    title: "Weather Advisory",
    description: "Heavy rain expected, potential service disruptions",
    severity: "low",
    timestamp: "2024-01-15 12:00",
    status: "resolved",
  },
]

export function SystemAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-blue-100 text-blue-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "critical":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const resolveAlert = (alertId: string) => {
    setAlerts(alerts.map((alert) => (alert.id === alertId ? { ...alert, status: "resolved" } : alert)))
  }

  const activeAlerts = alerts.filter((alert) => alert.status === "active")
  const resolvedAlerts = alerts.filter((alert) => alert.status === "resolved")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Alerts</h2>
          <p className="text-muted-foreground">Monitor and manage service alerts</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Alert
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create System Alert</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="alertTitle">Alert Title</Label>
                <Input id="alertTitle" placeholder="Brief alert description" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alertDescription">Description</Label>
                <Textarea id="alertDescription" placeholder="Detailed alert information" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="severity">Severity</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="route">Affected Route (Optional)</Label>
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location (Optional)</Label>
                <Input id="location" placeholder="Specific location" />
              </div>
              <Button className="w-full">Create Alert</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Active Alerts ({activeAlerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeAlerts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No active alerts</p>
            ) : (
              activeAlerts.map((alert) => (
                <div key={alert.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{alert.title}</h3>
                        <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {alert.timestamp}
                        </div>
                        {alert.route && (
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs">
                              {alert.route}
                            </Badge>
                          </div>
                        )}
                        {alert.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {alert.location}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => resolveAlert(alert.id)} className="gap-1">
                      <X className="h-3 w-3" />
                      Resolve
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resolved Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Resolved Alerts ({resolvedAlerts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {resolvedAlerts.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No resolved alerts</p>
            ) : (
              resolvedAlerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="border rounded-lg p-4 opacity-60">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{alert.title}</h3>
                        <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Resolved
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {alert.timestamp}
                        </div>
                        {alert.route && (
                          <Badge variant="outline" className="text-xs">
                            {alert.route}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

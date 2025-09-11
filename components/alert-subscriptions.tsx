"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, MapPin, Trash2, Plus } from "lucide-react"

const subscriptions = [
  {
    id: 1,
    type: "stop",
    name: "City Center - Route 45A",
    description: "Notify 5 minutes before arrival",
    active: true,
  },
  {
    id: 2,
    type: "route",
    name: "Route 12B Disruptions",
    description: "All delays and cancellations",
    active: true,
  },
  {
    id: 3,
    type: "stop",
    name: "University Gate - Route 78C",
    description: "Notify 3 minutes before arrival",
    active: false,
  },
]

export function AlertSubscriptions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Alert Subscriptions
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Alert
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {subscriptions.map((subscription) => (
          <div
            key={subscription.id}
            className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <h4 className="font-medium text-sm">{subscription.name}</h4>
                  <p className="text-xs text-muted-foreground">{subscription.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={subscription.active ? "default" : "secondary"}>
                  {subscription.active ? "Active" : "Paused"}
                </Badge>
                <Button size="sm" variant="ghost">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {subscriptions.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No alert subscriptions</p>
            <p className="text-xs">Add alerts for your favorite stops and routes</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

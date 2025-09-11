"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, Clock, AlertTriangle, Info, CheckCircle } from "lucide-react"

const notifications = [
  {
    id: 1,
    type: "arrival",
    title: "Bus 45A Arriving",
    message: "Your bus will arrive at City Center in 3 minutes",
    time: "2 min ago",
    read: false,
    icon: Bell,
  },
  {
    id: 2,
    type: "delay",
    title: "Route 12B Delayed",
    message: "Bus is running 8 minutes late due to traffic",
    time: "15 min ago",
    read: true,
    icon: AlertTriangle,
  },
  {
    id: 3,
    type: "info",
    title: "New Route Added",
    message: "Route 89D now connects Airport to Tech Park",
    time: "1 hour ago",
    read: true,
    icon: Info,
  },
  {
    id: 4,
    type: "arrival",
    title: "Bus 78C Arrived",
    message: "Your bus has arrived at University Gate",
    time: "2 hours ago",
    read: true,
    icon: CheckCircle,
  },
]

export function NotificationHistory() {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "arrival":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "delay":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "info":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Recent Notifications
          </div>
          <Button size="sm" variant="outline">
            Mark All Read
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {notifications.map((notification) => {
          const Icon = notification.icon
          return (
            <div
              key={notification.id}
              className={`p-3 rounded-lg border transition-colors ${
                notification.read ? "border-border bg-background" : "border-primary/20 bg-primary/5"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-1 rounded-full ${notification.read ? "bg-muted" : "bg-primary/10"}`}>
                  <Icon className={`h-4 w-4 ${notification.read ? "text-muted-foreground" : "text-primary"}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm">{notification.title}</h4>
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeColor(notification.type)}>{notification.type}</Badge>
                      {!notification.read && <div className="w-2 h-2 bg-primary rounded-full" />}
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mb-2">{notification.message}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {notification.time}
                    </div>
                    {!notification.read && (
                      <Button size="sm" variant="ghost" className="text-xs">
                        Mark Read
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

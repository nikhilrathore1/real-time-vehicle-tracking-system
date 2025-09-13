"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, MapPin, Bell } from "lucide-react"

const etaData = [
  {
    stop: "City Center",
    route: "45A",
    eta: "5 min",
    confidence: "high",
  },
  {
    stop: "Railway Station",
    route: "12B",
    eta: "12 min",
    confidence: "medium",
  },
  {
    stop: "University Gate",
    route: "78C",
    eta: "8 min",
    confidence: "high",
  },
]

export function ETAPanel() {
  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high":
        return "text-green-600"
      case "medium":
        return "text-yellow-600"
      case "low":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          ETA Predictions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {etaData.map((item, index) => (
          <div key={index} className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium text-sm">{item.stop}</div>
                  <div className="text-xs text-muted-foreground">Route {item.route}</div>
                </div>
              </div>
              <Button size="sm" variant="ghost">
                <Bell className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-primary" />
                <span className="font-medium text-primary">{item.eta}</span>
              </div>
              <span className={`${getConfidenceColor(item.confidence)} capitalize`}>{item.confidence} confidence</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

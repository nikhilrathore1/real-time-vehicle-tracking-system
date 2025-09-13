"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Settings, Smartphone, Volume2 } from "lucide-react"

export function NotificationSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Bus Arrival Alerts</Label>
              <p className="text-xs text-muted-foreground">Get notified when your bus is approaching</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Service Disruptions</Label>
              <p className="text-xs text-muted-foreground">Alerts for delays, cancellations, and route changes</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Route Updates</Label>
              <p className="text-xs text-muted-foreground">New routes and schedule changes</p>
            </div>
            <Switch />
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Notification Style</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm">Sound</Label>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm">Vibration</Label>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        <Button className="w-full">Save Settings</Button>
      </CardContent>
    </Card>
  )
}

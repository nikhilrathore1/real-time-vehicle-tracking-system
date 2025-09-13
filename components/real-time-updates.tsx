"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useWebSocket } from "@/hooks/use-websocket"
import { Wifi, WifiOff, RefreshCw, Clock } from "lucide-react"

interface RealTimeUpdatesProps {
  onBusUpdate?: (busData: any) => void
  onRouteDisruption?: (disruption: any) => void
}

export function RealTimeUpdates({ onBusUpdate, onRouteDisruption }: RealTimeUpdatesProps) {
  const { isConnected, error, subscribe } = useWebSocket()
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [updateCount, setUpdateCount] = useState(0)

  useEffect(() => {
    const unsubscribeBusUpdate = subscribe("busLocationUpdate", (data) => {
      setLastUpdate(new Date())
      setUpdateCount((prev) => prev + 1)
      onBusUpdate?.(data)
    })

    const unsubscribeDisruption = subscribe("routeDisruption", (data) => {
      onRouteDisruption?.(data)
    })

    return () => {
      unsubscribeBusUpdate()
      unsubscribeDisruption()
    }
  }, [subscribe, onBusUpdate, onRouteDisruption])

  const getConnectionStatus = () => {
    if (error) return { status: "error", color: "destructive", text: "Connection Error" }
    if (isConnected) return { status: "connected", color: "default", text: "Live Updates" }
    return { status: "disconnected", color: "secondary", text: "Offline Mode" }
  }

  const connectionInfo = getConnectionStatus()

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-muted-foreground" />
            )}
            Real-time Status
          </div>
          <Badge variant={connectionInfo.color as any} className="text-xs">
            {connectionInfo.text}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            {lastUpdate && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Last update: {lastUpdate.toLocaleTimeString()}</span>
              </div>
            )}
            {updateCount > 0 && <span>{updateCount} updates received</span>}
          </div>
          <Button size="sm" variant="ghost" className="h-6 px-2">
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>

        {error && <div className="mt-2 text-xs text-destructive">{error}</div>}
      </CardContent>
    </Card>
  )
}

"use client"

import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WifiOff, RefreshCw, MapPin, Clock } from "lucide-react"

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center">
              <WifiOff className="h-12 w-12 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground text-balance">You're Offline</h1>
              <p className="text-muted-foreground text-pretty mt-2">
                No internet connection detected. Some features may be limited.
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Available Offline Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Cached Route Information</h3>
                    <p className="text-sm text-muted-foreground">View previously loaded route details and schedules</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Saved Favorites</h3>
                    <p className="text-sm text-muted-foreground">Access your favorite routes and stops</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <RefreshCw className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Auto-Sync</h3>
                    <p className="text-sm text-muted-foreground">
                      Changes will sync automatically when connection is restored
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center space-y-4">
            <Button onClick={() => window.location.reload()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <p className="text-sm text-muted-foreground">Check your internet connection and try refreshing the page</p>
          </div>
        </div>
      </main>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Users, Bus, Route, AlertTriangle, TrendingUp, LogOut } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { BusManagement } from "./bus-management"
import { RouteManagement } from "./route-management"
import { AnalyticsDashboard } from "./analytics-dashboard"
import { SystemAlerts } from "./system-alerts"

const dashboardStats = [
  {
    title: "Active Buses",
    value: "142",
    change: "+5",
    trend: "up",
    icon: Bus,
  },
  {
    title: "Total Routes",
    value: "28",
    change: "+2",
    trend: "up",
    icon: Route,
  },
  {
    title: "Daily Passengers",
    value: "15,847",
    change: "+12%",
    trend: "up",
    icon: Users,
  },
  {
    title: "Service Alerts",
    value: "3",
    change: "-2",
    trend: "down",
    icon: AlertTriangle,
  },
]

export function AdminDashboard() {
  const { auth, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {auth.user?.name}</p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="gap-2 bg-transparent">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="buses">Fleet</TabsTrigger>
          <TabsTrigger value="routes">Routes</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboardStats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <TrendingUp
                            className={`h-3 w-3 ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}
                          />
                          <span className={`text-xs ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                            {stat.change}
                          </span>
                        </div>
                      </div>
                      <Icon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="h-20 flex-col gap-2" onClick={() => setActiveTab("buses")}>
                  <Bus className="h-6 w-6" />
                  Manage Fleet
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2 bg-transparent"
                  onClick={() => setActiveTab("routes")}
                >
                  <Route className="h-6 w-6" />
                  Manage Routes
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2 bg-transparent"
                  onClick={() => setActiveTab("analytics")}
                >
                  <BarChart className="h-6 w-6" />
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="buses">
          <BusManagement />
        </TabsContent>

        <TabsContent value="routes">
          <RouteManagement />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="alerts">
          <SystemAlerts />
        </TabsContent>
      </Tabs>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Users, Bus, Route, AlertTriangle, TrendingUp, LogOut } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { BusManagement } from "./bus-management"
import { RouteManagement } from "./route-management"
import { AnalyticsDashboard } from "./analytics-dashboard"
import { SystemAlerts } from "./system-alerts"

interface DashboardStats {
  activeBuses: number
  totalRoutes: number
  dailyPassengers: number
  serviceAlerts: number
  busesChange: string
  routesChange: string
  passengersChange: string
  alertsChange: string
}

export function AdminDashboard() {
  const { auth, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/admin/dashboard/stats", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  const dashboardStats = stats
    ? [
        {
          title: "Active Buses",
          value: stats.activeBuses.toString(),
          change: stats.busesChange,
          trend: stats.busesChange.startsWith("+") ? "up" : "down",
          icon: Bus,
        },
        {
          title: "Total Routes",
          value: stats.totalRoutes.toString(),
          change: stats.routesChange,
          trend: stats.routesChange.startsWith("+") ? "up" : "down",
          icon: Route,
        },
        {
          title: "Daily Passengers",
          value: stats.dailyPassengers.toLocaleString(),
          change: stats.passengersChange,
          trend: stats.passengersChange.startsWith("+") ? "up" : "down",
          icon: Users,
        },
        {
          title: "Service Alerts",
          value: stats.serviceAlerts.toString(),
          change: stats.alertsChange,
          trend: stats.alertsChange.startsWith("-") ? "down" : "up",
          icon: AlertTriangle,
        },
      ]
    : []

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {auth.user?.full_name}</p>
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
            {loading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/4"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              : dashboardStats.map((stat, index) => {
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

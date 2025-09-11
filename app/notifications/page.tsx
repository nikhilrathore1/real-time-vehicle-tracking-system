"use client"

import { Navbar } from "@/components/navbar"
import { NotificationSetup } from "@/components/notification-setup"
import { NotificationSettings } from "@/components/notification-settings"
import { NotificationHistory } from "@/components/notification-history"
import { AlertSubscriptions } from "@/components/alert-subscriptions"

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground text-balance">Notifications</h1>
            <p className="text-muted-foreground text-pretty">Manage your bus alerts and real-time notifications</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <NotificationSetup />
              <NotificationSettings />
              <AlertSubscriptions />
            </div>
            <NotificationHistory />
          </div>
        </div>
      </main>
    </div>
  )
}

import { Navbar } from "@/components/navbar"
import { CitySelector } from "@/components/city-selector"
import { RouteList } from "@/components/route-list"
import { QuickAccess } from "@/components/quick-access"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground text-balance">
            Welcome to Real Time Vehicle Tracking System
          </h1>
          <p className="text-muted-foreground text-pretty">Track your vehicles in real-time and never miss your ride</p>
        </div>

        <CitySelector />
        <QuickAccess />
        <RouteList />
      </main>
    </div>
  )
}

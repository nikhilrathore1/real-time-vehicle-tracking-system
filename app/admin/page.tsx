import { Navbar } from "@/components/navbar"
import { AdminLogin } from "@/components/admin-login"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground text-balance">Admin Dashboard</h1>
            <p className="text-muted-foreground text-pretty">Manage routes, buses, and system analytics</p>
          </div>

          <AdminLogin />
        </div>
      </main>
    </div>
  )
}

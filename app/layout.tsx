import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { AuthProvider } from "@/hooks/use-auth"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { OfflineIndicator } from "@/components/offline-indicator"
import { PWAInitializer } from "@/components/pwa-initializer"
import "./globals.css"

export const metadata: Metadata = {
  title: "Real Time Vehicle Tracking System", // Updated app title
  description: "Track vehicles in real-time, get ETA predictions, and stay updated with your city's public transport",
  generator: "Real Time Vehicle Tracking System", // Updated generator name
  manifest: "/manifest.json",
  themeColor: "#059669",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Real Time Vehicle Tracking System", // Updated Apple Web App title
  },
  icons: {
    icon: "/icon-192x192.png",
    apple: "/icon-192x192.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthProvider>
          <PWAInitializer />
          <OfflineIndicator />
          <Suspense fallback={null}>{children}</Suspense>
          <PWAInstallPrompt />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}

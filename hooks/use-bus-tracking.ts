"use client"

import { useState, useEffect, useCallback } from "react"
import type { BusLocation } from "@/lib/map-utils"

interface BusTrackingState {
  buses: BusLocation[]
  loading: boolean
  error: string | null
  lastUpdated: number | null
}

export function useBusTracking(routeId?: string) {
  const [state, setState] = useState<BusTrackingState>({
    buses: [],
    loading: true,
    error: null,
    lastUpdated: null,
  })

  const fetchBuses = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      // In a real app, this would be an API call
      // For now, we'll simulate with mock data
      const mockBuses: BusLocation[] = [
        {
          id: "MH12AB1234",
          route: "45A",
          lat: 18.5204 + (Math.random() - 0.5) * 0.01,
          lng: 73.8567 + (Math.random() - 0.5) * 0.01,
          status: "running",
          occupancy: "medium",
          speed: 35 + Math.floor(Math.random() * 10),
          heading: 45 + Math.floor(Math.random() * 20),
          timestamp: Date.now(),
        },
        {
          id: "MH12CD5678",
          route: "12B",
          lat: 18.5314 + (Math.random() - 0.5) * 0.01,
          lng: 73.8446 + (Math.random() - 0.5) * 0.01,
          status: Math.random() > 0.7 ? "delayed" : "running",
          occupancy: "high",
          speed: 15 + Math.floor(Math.random() * 15),
          heading: 180 + Math.floor(Math.random() * 20),
          timestamp: Date.now(),
        },
        {
          id: "MH12EF9012",
          route: "78C",
          lat: 18.5094 + (Math.random() - 0.5) * 0.01,
          lng: 73.8712 + (Math.random() - 0.5) * 0.01,
          status: "running",
          occupancy: "low",
          speed: 42 + Math.floor(Math.random() * 8),
          heading: 270 + Math.floor(Math.random() * 20),
          timestamp: Date.now(),
        },
      ]

      // Filter by route if specified
      const filteredBuses = routeId ? mockBuses.filter((bus) => bus.route === routeId) : mockBuses

      setState({
        buses: filteredBuses,
        loading: false,
        error: null,
        lastUpdated: Date.now(),
      })
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to fetch bus data",
      }))
    }
  }, [routeId])

  useEffect(() => {
    fetchBuses()

    // Set up real-time updates every 10 seconds
    const interval = setInterval(fetchBuses, 10000)

    return () => clearInterval(interval)
  }, [fetchBuses])

  const refreshBuses = useCallback(() => {
    fetchBuses()
  }, [fetchBuses])

  return {
    ...state,
    refreshBuses,
  }
}

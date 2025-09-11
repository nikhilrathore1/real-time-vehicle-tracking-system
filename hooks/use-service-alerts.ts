"use client"

import { useState, useEffect, useCallback } from "react"
import { realTimeAPI, type ServiceAlert } from "@/lib/real-time-api"

interface AlertsState {
  alerts: ServiceAlert[]
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

export function useServiceAlerts(activeOnly = true) {
  const [state, setState] = useState<AlertsState>({
    alerts: [],
    loading: true,
    error: null,
    lastUpdated: null,
  })

  const fetchAlerts = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      const alerts = activeOnly ? await realTimeAPI.getActiveServiceAlerts() : await realTimeAPI.getServiceAlerts()

      setState({
        alerts,
        loading: false,
        error: null,
        lastUpdated: new Date(),
      })
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to fetch service alerts",
      }))
    }
  }, [activeOnly])

  useEffect(() => {
    fetchAlerts()

    // Set up updates every minute for alerts
    const interval = setInterval(fetchAlerts, 60000)

    return () => clearInterval(interval)
  }, [fetchAlerts])

  const refresh = useCallback(() => {
    fetchAlerts()
  }, [fetchAlerts])

  return {
    ...state,
    refresh,
  }
}

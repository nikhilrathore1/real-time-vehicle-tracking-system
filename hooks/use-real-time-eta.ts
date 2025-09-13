"use client"

import { useState, useEffect, useCallback } from "react"

interface ETAPrediction {
  id: number
  busId: string
  routeId: string
  stopName: string
  estimatedArrival: Date
  delay: number
  confidence: string
  occupancy: string
  isRealTime: boolean
}

interface ETAState {
  predictions: ETAPrediction[]
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

export function useRealTimeETA(stopId?: string, routeId?: string) {
  const [state, setState] = useState<ETAState>({
    predictions: [],
    loading: true,
    error: null,
    lastUpdated: null,
  })

  const fetchETA = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      let url = "/api/stops"
      if (stopId) {
        url = `/api/stops/${stopId}/eta`
      } else if (routeId) {
        url = `/api/routes/${routeId}/eta`
      }

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("Failed to fetch ETA data")
      }

      const data = await response.json()

      // Transform API response to match component expectations
      const predictions: ETAPrediction[] = data.map((item: any) => ({
        id: item.id,
        busId: item.vehicle_id?.toString() || "Unknown",
        routeId: item.route_id || "Unknown",
        stopName: item.stop_name || "Unknown Stop",
        estimatedArrival: new Date(item.predicted_arrival_time),
        delay: item.delay_minutes || 0,
        confidence: item.confidence_level > 0.8 ? "high" : item.confidence_level > 0.6 ? "medium" : "low",
        occupancy: "medium", // This would come from vehicle data
        isRealTime: true,
      }))

      setState({
        predictions,
        loading: false,
        error: null,
        lastUpdated: new Date(),
      })
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to fetch ETA data",
      }))
    }
  }, [stopId, routeId])

  useEffect(() => {
    if (!stopId && !routeId) return

    fetchETA()

    // Set up real-time updates every 15 seconds
    const interval = setInterval(fetchETA, 15000)

    return () => clearInterval(interval)
  }, [fetchETA, stopId, routeId])

  const refresh = useCallback(() => {
    fetchETA()
  }, [fetchETA])

  return {
    ...state,
    refresh,
  }
}

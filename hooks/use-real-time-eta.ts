"use client"

import { useState, useEffect, useCallback } from "react"
import { realTimeAPI, type ETAPrediction } from "@/lib/real-time-api"

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

      let predictions: ETAPrediction[] = []

      if (stopId) {
        predictions = await realTimeAPI.getETAForStop(stopId)
      } else if (routeId) {
        predictions = await realTimeAPI.getETAForRoute(routeId)
      }

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

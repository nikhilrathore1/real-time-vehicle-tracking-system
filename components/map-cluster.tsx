"use client"

import { useEffect, useRef } from "react"

interface MapClusterProps {
  map: any
  buses: any[]
  onBusClick?: (busId: string) => void
}

export function MapCluster({ map, buses, onBusClick }: MapClusterProps) {
  const markersRef = useRef<Map<string, any>>(new Map())
  const clusterGroupRef = useRef<any>(null)

  useEffect(() => {
    if (!map || typeof window === "undefined") return

    // Dynamic import for marker clustering
    import("leaflet.markercluster")
      .then(() => {
        const L = (window as any).L

        if (!clusterGroupRef.current) {
          clusterGroupRef.current = L.markerClusterGroup({
            chunkedLoading: true,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
            maxClusterRadius: 50,
          })
          map.addLayer(clusterGroupRef.current)
        }
      })
      .catch(() => {
        // Fallback without clustering if library fails to load
        console.log("Marker clustering not available, using regular markers")
      })
  }, [map])

  useEffect(() => {
    if (!map || typeof window === "undefined") return

    const L = (window as any).L
    const currentMarkers = markersRef.current
    const clusterGroup = clusterGroupRef.current

    // Remove markers that are no longer in the buses array
    const currentBusIds = new Set(buses.map((bus) => bus.id))
    for (const [busId, marker] of currentMarkers.entries()) {
      if (!currentBusIds.has(busId)) {
        if (clusterGroup) {
          clusterGroup.removeLayer(marker)
        } else {
          map.removeLayer(marker)
        }
        currentMarkers.delete(busId)
      }
    }

    // Add or update markers for current buses
    buses.forEach((bus) => {
      const existingMarker = currentMarkers.get(bus.id)

      if (existingMarker) {
        // Update existing marker position
        existingMarker.setLatLng([bus.lat, bus.lng])

        // Update popup content
        existingMarker.setPopupContent(`
          <div class="bus-popup">
            <h3 class="font-semibold">${bus.id}</h3>
            <p class="text-sm">Route: ${bus.route}</p>
            <p class="text-sm">Status: ${bus.status}</p>
            <p class="text-sm">Speed: ${bus.speed} km/h</p>
            <p class="text-sm">Occupancy: ${bus.occupancy}</p>
          </div>
        `)
      } else {
        // Create new marker
        const busIcon = L.divIcon({
          html: `<div class="bus-marker ${bus.status}">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                     <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
                   </svg>
                 </div>`,
          className: "bus-icon",
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        })

        const marker = L.marker([bus.lat, bus.lng], { icon: busIcon }).bindPopup(`
            <div class="bus-popup">
              <h3 class="font-semibold">${bus.id}</h3>
              <p class="text-sm">Route: ${bus.route}</p>
              <p class="text-sm">Status: ${bus.status}</p>
              <p class="text-sm">Speed: ${bus.speed} km/h</p>
              <p class="text-sm">Occupancy: ${bus.occupancy}</p>
            </div>
          `)

        marker.on("click", () => {
          onBusClick?.(bus.id)
        })

        if (clusterGroup) {
          clusterGroup.addLayer(marker)
        } else {
          marker.addTo(map)
        }

        currentMarkers.set(bus.id, marker)
      }
    })
  }, [map, buses, onBusClick])

  return null
}

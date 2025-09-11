export interface BusStop {
  id: string
  name: string
  lat: number
  lng: number
  routes: string[]
  amenities: string[]
  accessibility: boolean
}

export interface RouteSchedule {
  id: string
  routeId: string
  direction: "forward" | "backward"
  departureTime: string
  arrivalTime: string
  frequency: number // minutes
  operatingDays: string[]
  isActive: boolean
}

export interface Route {
  id: string
  name: string
  shortName: string
  description: string
  coordinates: [number, number][]
  stops: BusStop[]
  schedules: RouteSchedule[]
  fare: number
  distance: number
  estimatedDuration: number
  color: string
  isActive: boolean
  operatingHours: {
    start: string
    end: string
  }
  frequency: number
  type: "regular" | "express" | "limited"
}

// Mock route data
export const mockRoutes: Route[] = [
  {
    id: "45A",
    name: "City Center - Airport Express",
    shortName: "45A",
    description: "Direct service from city center to airport with limited stops",
    coordinates: [
      [18.5204, 73.8567], // City Center
      [18.5234, 73.8587], // Shopping Mall
      [18.5264, 73.8607], // Hospital
      [18.5294, 73.8627], // IT Park
      [18.5324, 73.8647], // Airport Terminal 1
      [18.5354, 73.8667], // Airport Terminal 2
    ],
    stops: [
      {
        id: "stop_001",
        name: "City Center",
        lat: 18.5204,
        lng: 73.8567,
        routes: ["45A", "12B"],
        amenities: ["shelter", "seating", "digital_display"],
        accessibility: true,
      },
      {
        id: "stop_002",
        name: "Shopping Mall",
        lat: 18.5234,
        lng: 73.8587,
        routes: ["45A"],
        amenities: ["shelter", "seating"],
        accessibility: true,
      },
      {
        id: "stop_003",
        name: "Hospital",
        lat: 18.5264,
        lng: 73.8607,
        routes: ["45A", "78C"],
        amenities: ["shelter", "seating", "digital_display", "wheelchair_access"],
        accessibility: true,
      },
      {
        id: "stop_004",
        name: "IT Park",
        lat: 18.5294,
        lng: 73.8627,
        routes: ["45A", "12B"],
        amenities: ["shelter", "seating", "digital_display"],
        accessibility: true,
      },
      {
        id: "stop_005",
        name: "Airport Terminal 1",
        lat: 18.5324,
        lng: 73.8647,
        routes: ["45A"],
        amenities: ["shelter", "seating", "digital_display", "wifi"],
        accessibility: true,
      },
      {
        id: "stop_006",
        name: "Airport Terminal 2",
        lat: 18.5354,
        lng: 73.8667,
        routes: ["45A"],
        amenities: ["shelter", "seating", "digital_display", "wifi"],
        accessibility: true,
      },
    ],
    schedules: [
      {
        id: "sch_001",
        routeId: "45A",
        direction: "forward",
        departureTime: "05:00",
        arrivalTime: "05:40",
        frequency: 15,
        operatingDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
        isActive: true,
      },
    ],
    fare: 25,
    distance: 18.5,
    estimatedDuration: 40,
    color: "#059669",
    isActive: true,
    operatingHours: {
      start: "05:00",
      end: "23:00",
    },
    frequency: 15,
    type: "express",
  },
  {
    id: "12B",
    name: "Railway Station - IT Park",
    shortName: "12B",
    description: "Connects railway station to major IT hubs with frequent service",
    coordinates: [
      [18.5104, 73.8467],
      [18.5134, 73.8487],
      [18.5164, 73.8507],
      [18.5194, 73.8527],
      [18.5224, 73.8547],
      [18.5294, 73.8627],
    ],
    stops: [
      {
        id: "stop_007",
        name: "Railway Station",
        lat: 18.5104,
        lng: 73.8467,
        routes: ["12B", "78C"],
        amenities: ["shelter", "seating", "digital_display", "ticket_counter"],
        accessibility: true,
      },
      {
        id: "stop_008",
        name: "Market Square",
        lat: 18.5134,
        lng: 73.8487,
        routes: ["12B"],
        amenities: ["shelter", "seating"],
        accessibility: false,
      },
      {
        id: "stop_009",
        name: "University",
        lat: 18.5164,
        lng: 73.8507,
        routes: ["12B", "78C"],
        amenities: ["shelter", "seating", "digital_display"],
        accessibility: true,
      },
      {
        id: "stop_010",
        name: "Tech Hub",
        lat: 18.5194,
        lng: 73.8527,
        routes: ["12B"],
        amenities: ["shelter", "seating", "digital_display", "wifi"],
        accessibility: true,
      },
      {
        id: "stop_011",
        name: "Business District",
        lat: 18.5224,
        lng: 73.8547,
        routes: ["12B"],
        amenities: ["shelter", "seating", "digital_display"],
        accessibility: true,
      },
      {
        id: "stop_004",
        name: "IT Park",
        lat: 18.5294,
        lng: 73.8627,
        routes: ["45A", "12B"],
        amenities: ["shelter", "seating", "digital_display"],
        accessibility: true,
      },
    ],
    schedules: [
      {
        id: "sch_002",
        routeId: "12B",
        direction: "forward",
        departureTime: "05:30",
        arrivalTime: "06:15",
        frequency: 10,
        operatingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        isActive: true,
      },
    ],
    fare: 20,
    distance: 15.2,
    estimatedDuration: 45,
    color: "#3b82f6",
    isActive: true,
    operatingHours: {
      start: "05:30",
      end: "22:30",
    },
    frequency: 10,
    type: "regular",
  },
  {
    id: "78C",
    name: "Bus Stand - University",
    shortName: "78C",
    description: "Student special route connecting major educational institutions",
    coordinates: [
      [18.5004, 73.8367],
      [18.5034, 73.8387],
      [18.5064, 73.8407],
      [18.5094, 73.8427],
      [18.5124, 73.8447],
      [18.5164, 73.8507],
    ],
    stops: [
      {
        id: "stop_012",
        name: "Bus Stand",
        lat: 18.5004,
        lng: 73.8367,
        routes: ["78C"],
        amenities: ["shelter", "seating", "digital_display", "ticket_counter", "restroom"],
        accessibility: true,
      },
      {
        id: "stop_013",
        name: "Library",
        lat: 18.5034,
        lng: 73.8387,
        routes: ["78C"],
        amenities: ["shelter", "seating"],
        accessibility: true,
      },
      {
        id: "stop_014",
        name: "College Gate",
        lat: 18.5064,
        lng: 73.8407,
        routes: ["78C"],
        amenities: ["shelter", "seating", "digital_display"],
        accessibility: true,
      },
      {
        id: "stop_015",
        name: "Student Hostel",
        lat: 18.5094,
        lng: 73.8427,
        routes: ["78C"],
        amenities: ["shelter", "seating"],
        accessibility: false,
      },
      {
        id: "stop_016",
        name: "Sports Complex",
        lat: 18.5124,
        lng: 73.8447,
        routes: ["78C"],
        amenities: ["shelter", "seating", "digital_display"],
        accessibility: true,
      },
      {
        id: "stop_009",
        name: "University",
        lat: 18.5164,
        lng: 73.8507,
        routes: ["12B", "78C"],
        amenities: ["shelter", "seating", "digital_display"],
        accessibility: true,
      },
    ],
    schedules: [
      {
        id: "sch_003",
        routeId: "78C",
        direction: "forward",
        departureTime: "06:00",
        arrivalTime: "06:35",
        frequency: 20,
        operatingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        isActive: true,
      },
    ],
    fare: 15,
    distance: 12.8,
    estimatedDuration: 35,
    color: "#eab308",
    isActive: true,
    operatingHours: {
      start: "06:00",
      end: "21:00",
    },
    frequency: 20,
    type: "regular",
  },
]

export function getRouteById(id: string): Route | undefined {
  return mockRoutes.find((route) => route.id === id)
}

export function getRoutesByStop(stopId: string): Route[] {
  return mockRoutes.filter((route) => route.stops.some((stop) => stop.id === stopId))
}

export function searchRoutes(query: string): Route[] {
  const lowercaseQuery = query.toLowerCase()
  return mockRoutes.filter(
    (route) =>
      route.id.toLowerCase().includes(lowercaseQuery) ||
      route.name.toLowerCase().includes(lowercaseQuery) ||
      route.description.toLowerCase().includes(lowercaseQuery) ||
      route.stops.some((stop) => stop.name.toLowerCase().includes(lowercaseQuery)),
  )
}

export function findRoutesBetweenStops(fromStopName: string, toStopName: string): Route[] {
  const lowercaseFrom = fromStopName.toLowerCase()
  const lowercaseTo = toStopName.toLowerCase()

  return mockRoutes.filter((route) => {
    const hasFromStop = route.stops.some((stop) => stop.name.toLowerCase().includes(lowercaseFrom))
    const hasToStop = route.stops.some((stop) => stop.name.toLowerCase().includes(lowercaseTo))
    return hasFromStop && hasToStop
  })
}

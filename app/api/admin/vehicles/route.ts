import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth, isOperatorOrAdmin } from "@/lib/auth-utils"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    // Verify admin/operator access
    const auth = await verifyAuth(request)
    if (!auth || !isOperatorOrAdmin(auth.role)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const cityId = searchParams.get("city_id")
    const status = searchParams.get("status")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = (page - 1) * limit

    let queryText = `
      SELECT v.*, c.name as city_name, 
             va.route_id, r.route_number, r.route_name,
             va.driver_name, va.driver_phone,
             vl.latitude, vl.longitude, vl.timestamp as last_location_update
      FROM vehicles v
      LEFT JOIN cities c ON v.city_id = c.id
      LEFT JOIN vehicle_assignments va ON v.id = va.vehicle_id AND va.is_active = true
      LEFT JOIN routes r ON va.route_id = r.id
      LEFT JOIN LATERAL (
        SELECT latitude, longitude, timestamp
        FROM vehicle_locations
        WHERE vehicle_id = v.id
        ORDER BY timestamp DESC
        LIMIT 1
      ) vl ON true
      WHERE 1=1
    `
    const params: any[] = []

    if (cityId) {
      queryText += ` AND v.city_id = $${params.length + 1}`
      params.push(cityId)
    }

    if (status) {
      queryText += ` AND v.status = $${params.length + 1}`
      params.push(status)
    }

    queryText += ` ORDER BY v.vehicle_number LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    const result = await query(queryText, params)

    // Get total count
    let countQuery = "SELECT COUNT(*) FROM vehicles v WHERE 1=1"
    const countParams: any[] = []

    if (cityId) {
      countQuery += ` AND v.city_id = $${countParams.length + 1}`
      countParams.push(cityId)
    }

    if (status) {
      countQuery += ` AND v.status = $${countParams.length + 1}`
      countParams.push(status)
    }

    const countResult = await query(countQuery, countParams)
    const total = Number.parseInt(countResult.rows[0].count)

    return NextResponse.json({
      success: true,
      vehicles: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Admin get vehicles error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin/operator access
    const auth = await verifyAuth(request)
    if (!auth || !isOperatorOrAdmin(auth.role)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const {
      city_id,
      vehicle_number,
      vehicle_type,
      capacity,
      model,
      year_manufactured,
      fuel_type,
      is_accessible,
      has_ac,
      has_wifi,
      gps_device_id,
    } = await request.json()

    // Validate required fields
    if (!city_id || !vehicle_number) {
      return NextResponse.json({ error: "City ID and vehicle number are required" }, { status: 400 })
    }

    // Check if vehicle number already exists
    const existingVehicle = await query("SELECT id FROM vehicles WHERE vehicle_number = $1", [vehicle_number])

    if (existingVehicle.rows.length > 0) {
      return NextResponse.json({ error: "Vehicle with this number already exists" }, { status: 409 })
    }

    // Create new vehicle
    const result = await query(
      `INSERT INTO vehicles (
        city_id, vehicle_number, vehicle_type, capacity, model, 
        year_manufactured, fuel_type, is_accessible, has_ac, has_wifi, 
        gps_device_id, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'inactive')
      RETURNING *`,
      [
        city_id,
        vehicle_number,
        vehicle_type || "bus",
        capacity || 50,
        model,
        year_manufactured,
        fuel_type || "diesel",
        is_accessible || false,
        has_ac || false,
        has_wifi || false,
        gps_device_id,
      ],
    )

    return NextResponse.json({
      success: true,
      vehicle: result.rows[0],
    })
  } catch (error) {
    console.error("Admin create vehicle error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

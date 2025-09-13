import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth, isOperatorOrAdmin } from "@/lib/auth-utils"
import { query } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin/operator access
    const auth = await verifyAuth(request)
    if (!auth || !isOperatorOrAdmin(auth.role)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const vehicleId = params.id

    // Get vehicle details with assignments and recent locations
    const vehicleResult = await query(
      `SELECT v.*, c.name as city_name,
              va.route_id, r.route_number, r.route_name,
              va.driver_name, va.driver_phone, va.shift_start_time, va.shift_end_time
       FROM vehicles v
       LEFT JOIN cities c ON v.city_id = c.id
       LEFT JOIN vehicle_assignments va ON v.id = va.vehicle_id AND va.is_active = true
       LEFT JOIN routes r ON va.route_id = r.id
       WHERE v.id = $1`,
      [vehicleId],
    )

    if (vehicleResult.rows.length === 0) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
    }

    // Get recent location history
    const locationsResult = await query(
      `SELECT latitude, longitude, speed_kmh, heading, timestamp
       FROM vehicle_locations
       WHERE vehicle_id = $1
       ORDER BY timestamp DESC
       LIMIT 50`,
      [vehicleId],
    )

    return NextResponse.json({
      success: true,
      vehicle: {
        ...vehicleResult.rows[0],
        recent_locations: locationsResult.rows,
      },
    })
  } catch (error) {
    console.error("Admin get vehicle error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin/operator access
    const auth = await verifyAuth(request)
    if (!auth || !isOperatorOrAdmin(auth.role)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const vehicleId = params.id
    const updateData = await request.json()

    // Build dynamic update query
    const allowedFields = [
      "vehicle_number",
      "vehicle_type",
      "capacity",
      "model",
      "year_manufactured",
      "fuel_type",
      "is_accessible",
      "has_ac",
      "has_wifi",
      "gps_device_id",
      "status",
    ]

    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = $${paramIndex}`)
        values.push(updateData[key])
        paramIndex++
      }
    })

    if (updates.length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(vehicleId)

    const result = await query(
      `UPDATE vehicles SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values,
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      vehicle: result.rows[0],
    })
  } catch (error) {
    console.error("Admin update vehicle error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin access only
    const auth = await verifyAuth(request)
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const vehicleId = params.id

    // Check if vehicle has active assignments
    const assignmentCheck = await query(
      "SELECT id FROM vehicle_assignments WHERE vehicle_id = $1 AND is_active = true",
      [vehicleId],
    )

    if (assignmentCheck.rows.length > 0) {
      return NextResponse.json({ error: "Cannot delete vehicle with active assignments" }, { status: 400 })
    }

    // Delete vehicle (cascade will handle related records)
    const result = await query("DELETE FROM vehicles WHERE id = $1 RETURNING *", [vehicleId])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Vehicle deleted successfully",
    })
  } catch (error) {
    console.error("Admin delete vehicle error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const stopId = params.id

    // Get ETA predictions for this stop
    const result = await query(
      `
      SELECT eta.*, v.vehicle_number, r.route_number, r.route_name
      FROM eta_predictions eta
      JOIN vehicles v ON eta.vehicle_id = v.id
      JOIN vehicle_assignments va ON v.id = va.vehicle_id AND va.is_active = true
      JOIN routes r ON va.route_id = r.id
      WHERE eta.stop_id = $1 
        AND eta.predicted_arrival_time > NOW()
        AND v.status = 'active'
      ORDER BY eta.predicted_arrival_time
    `,
      [stopId],
    )

    return NextResponse.json({
      success: true,
      predictions: result.rows,
    })
  } catch (error) {
    console.error("Get ETA predictions error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

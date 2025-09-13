import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth, verifyPassword, hashPassword } from "@/lib/auth-utils"
import { query } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request)
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { current_password, new_password } = await request.json()

    // Validate input
    if (!current_password || !new_password) {
      return NextResponse.json({ error: "Current password and new password are required" }, { status: 400 })
    }

    // Validate new password strength
    if (new_password.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters long" }, { status: 400 })
    }

    // Get current password hash
    const result = await query("SELECT password_hash FROM users WHERE id = $1", [auth.userId])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = result.rows[0]

    // Verify current password
    const isValidPassword = await verifyPassword(current_password, user.password_hash)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    // Hash new password
    const newPasswordHash = await hashPassword(new_password)

    // Update password
    await query("UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [
      newPasswordHash,
      auth.userId,
    ])

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    })
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

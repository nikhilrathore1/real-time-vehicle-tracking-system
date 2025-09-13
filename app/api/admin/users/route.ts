import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth, isAdmin, hashPassword } from "@/lib/auth-utils"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const auth = await verifyAuth(request)
    if (!auth || !isAdmin(auth.role)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")
    const isActive = searchParams.get("active") !== "false"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = (page - 1) * limit

    let queryText = `
      SELECT id, email, full_name, phone, role, is_active, created_at, updated_at
      FROM users
      WHERE is_active = $1
    `
    const params = [isActive]

    if (role) {
      queryText += ` AND role = $${params.length + 1}`
      params.push(role)
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    const result = await query(queryText, params)

    // Get total count
    let countQuery = "SELECT COUNT(*) FROM users WHERE is_active = $1"
    const countParams = [isActive]

    if (role) {
      countQuery += ` AND role = $${countParams.length + 1}`
      countParams.push(role)
    }

    const countResult = await query(countQuery, countParams)
    const total = Number.parseInt(countResult.rows[0].count)

    return NextResponse.json({
      success: true,
      users: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Admin get users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const auth = await verifyAuth(request)
    if (!auth || !isAdmin(auth.role)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { email, password, full_name, phone, role } = await request.json()

    // Validate required fields
    if (!email || !password || !full_name || !role) {
      return NextResponse.json({ error: "Email, password, full name, and role are required" }, { status: 400 })
    }

    // Validate role
    const validRoles = ["user", "operator", "admin"]
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role. Must be user, operator, or admin" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()])

    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const result = await query(
      `INSERT INTO users (email, password_hash, full_name, phone, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, full_name, phone, role, is_active, created_at`,
      [email.toLowerCase(), passwordHash, full_name, phone, role],
    )

    return NextResponse.json({
      success: true,
      user: result.rows[0],
    })
  } catch (error) {
    console.error("Admin create user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

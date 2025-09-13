// Authentication utilities and JWT handling
import { SignJWT, jwtVerify } from "jose"
import bcrypt from "bcryptjs"
import type { NextRequest } from "next/server"
import { query } from "./database"

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = "7d"

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required")
}

// Convert string secret to Uint8Array for jose
const secret = new TextEncoder().encode(JWT_SECRET)

export interface JWTPayload {
  userId: number
  email: string
  role: string
}

// Generate JWT token
export async function generateToken(payload: JWTPayload): Promise<string> {
  try {
    const jwt = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(JWT_EXPIRES_IN)
      .sign(secret)

    return jwt
  } catch (error) {
    console.error("JWT generation error:", error)
    throw new Error("Failed to generate authentication token")
  }
}

// Verify JWT token
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    if (!token || typeof token !== "string") {
      return null
    }

    const { payload } = await jwtVerify(token, secret)
    return payload as JWTPayload
  } catch (error) {
    console.error("JWT verification error:", error)
    return null
  }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  try {
    return await bcrypt.hash(password, 12)
  } catch (error) {
    console.error("Password hashing error:", error)
    throw new Error("Failed to hash password")
  }
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hashedPassword)
  } catch (error) {
    console.error("Password verification error:", error)
    return false
  }
}

// Extract token from request
export function getTokenFromRequest(request: NextRequest): string | null {
  try {
    const authHeader = request.headers.get("authorization")
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7)
    }

    // Also check cookies
    const tokenCookie = request.cookies.get("auth-token")
    return tokenCookie?.value || null
  } catch (error) {
    console.error("Token extraction error:", error)
    return null
  }
}

// Middleware to verify authentication
export async function verifyAuth(request: NextRequest): Promise<JWTPayload | null> {
  try {
    const token = getTokenFromRequest(request)
    if (!token) return null

    const payload = await verifyToken(token)
    if (!payload) return null

    // Verify user still exists and is active
    const result = await query("SELECT id, email, role, is_active FROM users WHERE id = $1 AND is_active = true", [
      payload.userId,
    ])

    if (result.rows.length === 0) return null

    return payload
  } catch (error) {
    console.error("Auth verification error:", error)
    return null
  }
}

// Check if user has required role
export function hasRole(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole)
}

// Admin role check
export function isAdmin(userRole: string): boolean {
  return userRole === "admin"
}

// Operator or admin role check
export function isOperatorOrAdmin(userRole: string): boolean {
  return ["admin", "operator"].includes(userRole)
}

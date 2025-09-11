"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"
import { type AuthState, authenticate, logout } from "@/lib/auth"

const AuthContext = createContext<{
  auth: AuthState
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
} | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })

  useEffect(() => {
    // Check for existing auth token
    const token = localStorage.getItem("auth_token")
    if (token) {
      // In production, validate token with server
      setAuth({
        user: JSON.parse(localStorage.getItem("auth_user") || "null"),
        isAuthenticated: true,
        isLoading: false,
      })
    } else {
      setAuth((prev) => ({ ...prev, isLoading: false }))
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setAuth((prev) => ({ ...prev, isLoading: true }))

    try {
      const user = await authenticate(email, password)
      if (user) {
        localStorage.setItem("auth_token", "mock_token")
        localStorage.setItem("auth_user", JSON.stringify(user))
        setAuth({
          user,
          isAuthenticated: true,
          isLoading: false,
        })
        return true
      }
    } catch (error) {
      console.error("Login failed:", error)
    }

    setAuth((prev) => ({ ...prev, isLoading: false }))
    return false
  }

  const handleLogout = async (): Promise<void> => {
    await logout()
    localStorage.removeItem("auth_token")
    localStorage.removeItem("auth_user")
    setAuth({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })
  }

  return <AuthContext.Provider value={{ auth, login, logout: handleLogout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

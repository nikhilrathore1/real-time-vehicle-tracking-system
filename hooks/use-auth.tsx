"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"

interface User {
  id: number
  email: string
  full_name: string
  role: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

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
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      })

      if (response.ok) {
        const user = await response.json()
        setAuth({
          user,
          isAuthenticated: true,
          isLoading: false,
        })
      } else {
        setAuth((prev) => ({ ...prev, isLoading: false }))
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setAuth((prev) => ({ ...prev, isLoading: false }))
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    setAuth((prev) => ({ ...prev, isLoading: true }))

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const user = await response.json()
        setAuth({
          user,
          isAuthenticated: true,
          isLoading: false,
        })
        return true
      } else {
        const error = await response.json()
        console.error("Login failed:", error.message)
      }
    } catch (error) {
      console.error("Login failed:", error)
    }

    setAuth((prev) => ({ ...prev, isLoading: false }))
    return false
  }

  const handleLogout = async (): Promise<void> => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
    } catch (error) {
      console.error("Logout failed:", error)
    }

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

export interface User {
  id: number
  email: string
  full_name: string
  role: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

// Simple authentication without JWT for development
export async function authenticate(email: string, password: string): Promise<User | null> {
  // Demo credentials for development
  if (email === "admin@vehicletracker.com" && password === "admin123") {
    return {
      id: 1,
      email: "admin@vehicletracker.com",
      full_name: "System Administrator",
      role: "admin",
    }
  }

  if (email === "operator@vehicletracker.com" && password === "operator123") {
    return {
      id: 2,
      email: "operator@vehicletracker.com",
      full_name: "Fleet Operator",
      role: "operator",
    }
  }

  return null
}

export async function logout(): Promise<void> {
  // Simple logout - just clear local storage
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("auth_user")
  }
}

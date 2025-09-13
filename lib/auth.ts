export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "operator" | "viewer"
  permissions: string[]
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

// Mock authentication - in production, integrate with your auth provider
export const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@vehicletracker.com", // Updated admin email
    name: "System Administrator",
    role: "admin",
    permissions: ["manage_routes", "manage_fleet", "view_analytics", "manage_users"],
  },
  {
    id: "2",
    email: "operator@vehicletracker.com", // Updated operator email
    name: "Vehicle Operator",
    role: "operator",
    permissions: ["manage_fleet", "view_analytics"],
  },
]

export const authenticate = async (email: string, password: string): Promise<User | null> => {
  // Mock authentication - replace with real auth
  await new Promise((resolve) => setTimeout(resolve, 1000))

  if (password === "admin123") {
    return mockUsers.find((user) => user.email === email) || null
  }

  return null
}

export const logout = async (): Promise<void> => {
  // Clear auth state
  localStorage.removeItem("auth_token")
}

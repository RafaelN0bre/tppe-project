"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { apiClient } from "@/lib/api"

interface User {
  id: string
  name: string
  email: string
  cpf: string
  phones: Array<{
    country_code: string
    area_code: string
    number: string
  }>
  address: {
    street: string
    number: string
    neighborhood: string
    city: string
    state: string
    zip_code: string
  }
  role: "GUEST" | "HOST" | "ADMIN"
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  refreshUser: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const isAuthenticated = !!user

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        setLoading(false)
        return
      }

      // Try to get current user info
      const response = await apiClient.getCurrentUser()
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.data || userData) // Handle different response formats
      } else {
        // Token might be expired, clear it
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      // Clear tokens on error
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
    } finally {
      setLoading(false)
    }
  }

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await apiClient.login(username, password)

      if (response.ok) {
        const data = await response.json()
        // Store tokens
        localStorage.setItem("access_token", data.access_token)
        if (data.refresh_token) {
          localStorage.setItem("refresh_token", data.refresh_token)
        }

        // Get user info
        await refreshUser()
        return true
      } else {
        return false
      }
    } catch (error) {
      console.error("Login failed:", error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    setUser(null)
  }

  const refreshUser = async () => {
    debugger
    try {
      const response = await apiClient.getCurrentUser()
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.data || userData)
      }
    } catch (error) {
      console.error("Failed to refresh user:", error)
    }
  }

  const value = {
    user,
    loading,
    login,
    logout,
    refreshUser,
    isAuthenticated,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

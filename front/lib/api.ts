const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    // Remove trailing slash and ensure we don't double up on /api
    this.baseURL = baseURL.replace(/\/+$/, "")
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("access_token")
    }
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<Response> {
    // Always get the latest token before each request
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("access_token")
    }
    // Ensure endpoint starts with /
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`
    const url = `${this.baseURL}${cleanEndpoint}`

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    } as Record<string, string>

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`
    }

    try {
      console.log(`Making request to: ${url}`) // Debug log

      // Add timeout and better error handling
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
        mode: "cors", // Explicitly set CORS mode
      })

      clearTimeout(timeoutId)

      console.log(`Response status: ${response.status}`) // Debug log

      if (response.status === 401) {
        // Token expired, try to refresh
        await this.refreshToken()
        // Retry the original request
        return this.request(endpoint, options)
      }

      return response
    } catch (error) {
      console.error(`Network error for ${url}:`, error)

      // Provide more specific error information
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("Request timeout - the server took too long to respond")
        } else if (error.message.includes("Failed to fetch")) {
          throw new Error("Network error - check if the API server is running and accessible")
        }
      }

      throw error
    }
  }

  // Add a health check method
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/`, {
        method: "GET",
        mode: "cors",
      })
      return {
        status: response.status,
        ok: response.ok,
        url: `${this.baseURL}/`,
      }
    } catch (error) {
      return {
        status: 0,
        ok: false,
        error: error instanceof Error ? error.message : String(error),
        url: `${this.baseURL}/`,
      }
    }
  }

  private async refreshToken() {
    const refreshToken = localStorage.getItem("refresh_token")
    if (!refreshToken) {
      throw new Error("No refresh token available")
    }

    const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    if (response.ok) {
      const data = await response.json()
      this.token = data.access_token
      localStorage.setItem("access_token", data.access_token)
      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token)
      }
    } else {
      // Refresh failed, redirect to login
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
      window.location.href = "/auth/login"
    }
  }

  // Authentication
  async login(username: string, password: string) {
    const response = await fetch(`${this.baseURL}/api/auth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        username,
        password,
        grant_type: "password",
      }),
    })
    return response
  }

  async getCurrentUser() {
    return this.request("/api/auth/me")
  }

  // Users
  async createUser(userData: any) {
    return this.request("/api/users/", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async getUsers() {
    return this.request("/api/users/")
  }

  async getUser(userId: string) {
    return this.request(`/api/users/${userId}`)
  }

  async updateUser(userId: string, userData: any) {
    return this.request(`/api/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    })
  }

  async deleteUser(userId: string) {
    return this.request(`/api/users/${userId}`, {
      method: "DELETE",
    })
  }

  // Properties
  async getProperties(ownerId?: string) {
    const query = ownerId ? `?owner_id=${ownerId}` : ""
    return this.request(`/api/properties/${query}`)
  }

  async getProperty(propertyId: string) {
    return this.request(`/api/properties/${propertyId}`)
  }

  async createProperty(propertyData: any) {
    return this.request("/api/properties/", {
      method: "POST",
      body: JSON.stringify(propertyData),
    })
  }

  async updateProperty(propertyId: string, propertyData: any) {
    return this.request(`/api/properties/${propertyId}`, {
      method: "PUT",
      body: JSON.stringify(propertyData),
    })
  }

  async deleteProperty(propertyId: string) {
    return this.request(`/api/properties/${propertyId}`, {
      method: "DELETE",
    })
  }

  // Reservations
  async getReservations(propertyId?: string, userId?: string) {
    let params = []
    if (propertyId) params.push(`property_id=${propertyId}`)
    if (userId) params.push(`user_id=${userId}`)
    const query = params.length ? `?${params.join("&")}` : ""
    return this.request(`/api/reservations/${query}`)
  }

  async getReservation(reservationId: string) {
    return this.request(`/api/reservations/${reservationId}`)
  }

  async createReservation(reservationData: any) {
    return this.request("/api/reservations/", {
      method: "POST",
      body: JSON.stringify(reservationData),
    })
  }

  async updateReservation(reservationId: string, reservationData: any) {
    return this.request(`/api/reservations/${reservationId}`, {
      method: "PUT",
      body: JSON.stringify(reservationData),
    })
  }

  async deleteReservation(reservationId: string) {
    return this.request(`/api/reservations/${reservationId}`, {
      method: "DELETE",
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
